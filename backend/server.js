const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); //hashing
const jwt = require('jsonwebtoken'); //authentication
const path = require('path');

// MongoDB connection
const uri = "mongodb+srv://visionxforum:visionxforum@jul24.foyevhn.mongodb.net/?appName=Jul24";
mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Error connecting to MongoDB", err));

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../')));

// Mongoose schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const questionSchema = new mongoose.Schema({
  title: String,
  content: String,
  username: String,
  comments: [{
    username: String,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }]
});


const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
      res.status(200).send({ message: 'Login successful', token });
    } else {
      res.status(400).send({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/questions', async (req, res) => {
  const { title, content } = req.body;
  const token = req.headers['authorization'].split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const question = new Question({
      title,
      content,
      username: decoded.username,
      comments: []
    });
    await question.save();
    res.status(201).send(question);
  } catch (error) {
    console.error('Error posting question:', error);
    res.status(400).send(error);
  }
});

app.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).send(questions);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/questions/:id/comments', async (req, res) => {
  const { comment } = req.body;
  const token = req.headers['authorization'].split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const question = await Question.findById(req.params.id);
    question.comments.push({
      username: decoded.username,
      comment,
      createdAt: new Date()
    });
    await question.save();
    res.status(201).send(question);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(400).send({ error: 'Failed to add comment', details: error });
  }
});




app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
