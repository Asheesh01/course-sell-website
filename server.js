const express = require('express');
const mongoose = require('mongoose');
const stripe = require('stripe')('your-stripe-secret-key');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (Replace with your own credentials if needed)
mongoose.connect('mongodb://localhost:27017/Course', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Course schema for MongoDB
const courseSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});

const Course = mongoose.model('Course', courseSchema);

// Routes

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching courses' });
  }
});

// Create a new course (Admin only)
app.post('/api/courses', async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const course = new Course({ name, description, price });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).send({ message: 'Error creating course' });
  }
});

// Stripe payment endpoint
app.post('/api/payment', async (req, res) => {
  const { amount, token } = req.body;

  try {
    const charge = await stripe.charges.create({
      amount: amount * 100,  // Stripe expects the amount in cents
      currency: 'usd',
      source: token.id,
      description: 'Course Purchase',
    });
    res.status(200).send({ message: 'Payment successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Payment failed!' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
