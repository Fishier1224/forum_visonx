const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
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
const questionSchema = new mongoose.Schema({
  title: String,
  content: String,
  comments: [{
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

const Question = mongoose.model('Question', questionSchema);

// Routes
app.post('/questions', async (req, res) => {
  const { title, content } = req.body;

  try {
    const question = new Question({
      title,
      content,
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

  try {
    const question = await Question.findById(req.params.id);
    question.comments.push({
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
