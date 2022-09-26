const express = require('express');
const app = express();
app.use(express.json());

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
// Database (MangoDB)
const mongoose = require('mongoose');

mongoose
  .connect(
    `mongodb+srv://Haroun:piiquante@cluster0.chgm0zk.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log('Connected to database !'))
  .catch(() => console.error('Connection failed...'));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

// Routage
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
module.exports = app;
