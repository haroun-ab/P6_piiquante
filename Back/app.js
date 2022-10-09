const express = require('express');
const app = express();
app.use(express.json());
const path = require('path');

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

const dotenv = require('dotenv');
dotenv.config();
//// Database (MangoDB) ////
const mongoose = require('mongoose');
const userName = process.env.MONGO_ID;
const password = process.env.MONGO_PASSWORD;
mongoose
  .connect(
    `mongodb+srv://${userName}:${password}@cluster0.chgm0zk.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log('Connected to database !'))
  .catch(() => console.error('Connection failed...'));

//// Access-Control-Allow-Origin ////
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

// Configuration du serveur pour pouvoir renvoyer des fichiers statiques
app.use('/images', express.static(path.join(__dirname, 'images')));
//// Routage ////
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;
