require('dotenv').config();
console.log('Environment variables loaded:', {
  MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not set',
  GROQ_API_KEY: process.env.GROQ_API_KEY ? 'Set' : 'Not set'
});
const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

const userModel = require('./model/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const postModel = require('./model/post');
const ejs = require('ejs');
const communityModel = require('./model/community');
const commentModel = require('./model/comment');
const dbConnect = require('./lib/dbConnect');

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(express.urlencoded());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure DB connection is ready for each serverless invocation.
app.use(async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    res.status(500).send('Database connection failed');
  }
});

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function isLoggedin(req, res, next) {
  if (!req.cookies.token) {
    return res.redirect('/login');
  }
  try {
    const data = jwt.verify(req.cookies.token, "shhhh");
    req.user = data;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect('/login');
  }
}

async function getCurrentUser(req) {
  if (!req.cookies.token) return null;
  try {
    const data = jwt.verify(req.cookies.token, "shhhh");
    return await userModel.findOne({ email: data.email });
  } catch {
    return null;
  }
}

// Communities
app.get('/communities', async (req, res) => {
  try {
    const communities = await communityModel.find()
      .populate('creator', 'name username')
      .sort({ memberCount: -1, createdAt: -1 });
    const user = await getCurrentUser(req);
    res.render('communities', { communities, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading communities');
  }
});

app.get('/community/create', isLoggedin, (req, res) => {
  res.render('createCommunity');
});

app.post('/community/create', isLoggedin, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const user = await userModel.findOne({ email: req.user.email });
    
    const community = await communityModel.create({
      name,
      description,
      creator: user._id,
      isPrivate: isPrivate === 'on',
      members: [{ user: user._id, role: 'admin' }]
    });
    
    res.redirect(`/community/${community._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating community');
  }
});

app.get('/community/:id', async (req, res) => {
  try {
    const community = await communityModel.findById(req.params.id)
      .populate('creator', 'name username')
      .populate('members.user', 'name username');
    
    if (!community) return res.status(404).send('Community not found');
    
    const posts = await postModel.find({ community: community._id, isDeleted: false })
      .populate('author', 'name username')
      .sort({ createdAt: -1 });
    
    const user = await getCurrentUser(req);
    const isMember = user && community.isMember(user._id);
    
    res.render('communityDetail', { community, posts, user, isMember });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading community');
  }
});

app.get('/community/join/:joinLink', async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.redirect('/login?redirect=' + req.originalUrl);
    
    const community = await communityModel.findOne({ joinLink: req.params.joinLink });
    if (!community) return res.status(404).send('Community not found');
    
    if (!community.isMember(user._id)) {
      await community.addMember(user._id, 'member');
    }
    
    res.redirect(`/community/${community._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error joining community');
  }
});

app.post('/community/:id/join', isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const community = await communityModel.findById(req.params.id);
    
    if (!community.isMember(user._id)) {
      await community.addMember(user._id, 'member');
    }
    
    res.redirect(`/community/${community._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error joining community');
  }
});

app.post('/community/:id/leave', isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const community = await communityModel.findById(req.params.id);
    
    await community.removeMember(user._id);
    res.redirect('/communities');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error leaving community');
  }
});

// Trending
app.get('/trending', async (req, res) => {
  try {
    const posts = await postModel.find({ isDeleted: false })
      .populate('author', 'name username')
      .populate('community', 'name')
      .sort({ createdAt: -1 });
    
    const user = await getCurrentUser(req);
    res.render('trending', { posts, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading trending prompts');
  }
});

// Auth
app.get('/signin', (req, res) => res.render('signin'));
app.get('/login', async (req, res) => res.render('login'));

app.post('/signin', async (req, res) => {
  try {
    const { email, password, name, username, age } = req.body;
    let user = await userModel.findOne({ email });
    if (user) return res.send("User already exists");
    
    const hashedPassword = await bcrypt.hash(password, 4);
    user = await userModel.create({
      email,
      password: hashedPassword,
      name,
      username,
      age
    });
    
    const token = jwt.sign({ email }, "shhhh");
    setAuthCookie(res, token);
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating account');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    
    if (!user) return res.status(400).send('User not found');
    
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign({ email }, "shhhh");
      setAuthCookie(res, token);
      res.redirect("/profile");
    } else {
      res.send('Invalid Credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

// Profile
app.get('/profile', isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email })
      .populate({
        path: 'post',
        match: { isDeleted: false }
      });
    res.render('profile', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading profile');
  }
});

app.post('/profile/update', isLoggedin, async (req, res) => {
  try {
    const { name, username, age } = req.body;
    await userModel.findOneAndUpdate(
      { email: req.user.email },
      { name, username, age }
    );
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating profile');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction
  });
  res.redirect('/login');
});

// Forms
app.get('/form', isLoggedin, (req, res) => res.render('form'));
app.get('/generate', isLoggedin, (req, res) => res.render('generate'));

app.get('/post', isLoggedin, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  const myCommunities = await communityModel.find({ 'members.user': user._id });
  res.render('addprompt', { user, myCommunities });
});

// Home
app.get('/home', isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email })
      .populate({
        path: 'post',
        match: { isDeleted: false },
        populate: { path: 'author', select: 'name username' }
      });
    
    const userId = user._id.toString();
    const promptsWithLikes = (user.post || []).map(prompt => ({
      ...prompt.toObject(),
      isLiked: prompt.likes && prompt.likes.some(like => like.toString() === userId)
    }));
    
    res.render('home', { prompts: promptsWithLikes, user, userid: userId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading home');
  }
});

// Post creation
app.post('/post', isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const { title, content, category, communityId } = req.body;
    
    const post = await postModel.create({
      title,
      content,
      category: category || 'general',
      author: user._id,
      community: communityId || null,
      isPublic: !communityId
    });
    
    if (communityId) {
      const community = await communityModel.findById(communityId);
      if (community) {
        community.prompts.push(post._id);
        await community.save();
      }
    }
    
    user.post.push(post._id);
    await user.save();
    
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating post');
  }
});

// View post
app.get('/post/view/:id', async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id)
      .populate('author', 'name username')
      .populate('community', 'name');
    
    if (!post) return res.status(404).send('Post not found');
    
    post.views += 1;
    await post.save();
    
    const comments = await commentModel.find({ post: post._id, parent: null })
      .populate('author', 'name username')
      .sort({ createdAt: -1 });
    
    for (let comment of comments) {
      comment = comment.toObject();
      comment.replies = await commentModel.find({ parent: comment._id })
        .populate('author', 'name username')
        .sort({ createdAt: 1 });
    }
    
    const user = await getCurrentUser(req);
    const isLiked = user && post.likes.some(l => l.toString() === user._id.toString());
    
    res.render('postDetail', { post, comments, user, isLiked });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading post');
  }
});

// Like post
app.get('/like/:id', isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const post = await postModel.findById(req.params.id);
    
    if (!post) return res.status(404).send('Post not found');
    
    const likedIndex = post.likes.findIndex(l => l.toString() === user._id.toString());
    
    if (likedIndex === -1) {
      post.likes.push(user._id);
    } else {
      post.likes.splice(likedIndex, 1);
    }
    
    await post.save();
    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error liking post');
  }
});

// Add comment
app.post('/post/:id/comment', isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const { content, parentId } = req.body;
    
    const comment = await commentModel.create({
      content,
      author: user._id,
      post: req.params.id,
      parent: parentId || null
    });
    
    if (parentId) {
      const parentComment = await commentModel.findById(parentId);
      parentComment.replies.push(comment._id);
      await parentComment.save();
    }
    
    res.redirect(`/post/view/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding comment');
  }
});

// Delete post
app.post('/post/:id/delete', isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const post = await postModel.findById(req.params.id);
    
    if (!post) return res.status(404).send('Post not found');
    if (post.author.toString() !== user._id.toString()) {
      return res.status(403).send('Not authorized');
    }
    
    post.isDeleted = true;
    await post.save();
    
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting post');
  }
});

// Edit post
app.get('/edit/:id', isLoggedin, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    const user = await userModel.findOne({ email: req.user.email });
    
    if (!post || post.author.toString() !== user._id.toString()) {
      return res.redirect('/home');
    }
    
    res.render('edit', { post, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading post');
  }
});

app.post('/edit/:id', isLoggedin, async (req, res) => {
  try {
    const { title, content } = req.body;
    await postModel.findByIdAndUpdate(req.params.id, { title, content });
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating post');
  }
});

// AI Generate
app.post("/generate", async (req, res) => {
  try {
    const { userPrompt } = req.body;
    
    const Groq = require("groq-sdk");
    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a professional prompt engineer. Take user input and create structured, detailed, powerful AI prompts."
        },
        {
          role: "user",
          content: `Create a powerful AI prompt for: ${userPrompt}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    res.json({ improvedPrompt: response.choices[0].message.content });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ error: "AI request failed" });
  }
});

// Contact
app.get('/contact', (req, res) => res.render('contact'));

app.post('/contact', async (req, res) => {
  try {
    const contactModel = require('./model/contact');
    const { name, email, message } = req.body;
    await contactModel.create({ name, email, message });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit message' });
  }
});

// Root
app.get('/', (req, res) => {
  if (!req.cookies.token) {
    return res.redirect('/login');
  }
  return res.redirect('/home');
});

// Server
app.listen(PORT, () => {
  console.log('App module loaded, but not listening. To run locally, add app.listen.');
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;