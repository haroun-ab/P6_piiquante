const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
  const passwordRegExp = new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&./-_#:])[A-Za-z0-9@$!%*?&./-_#:]{8,}$`,
    'g'
  );
  const emailRegExp = new RegExp(
    '^[a-zA-Z0-9.-_]+[@]{1}[a-zA-Z0-9.-_]+[.]{1}[a-z]{2,10}$',
    'g'
  );
  console.log(req.body.password);
  if (!passwordRegExp.test(req.body.password)) {
    res.status(401).json({ message: 'mot de passe non conforme' });
  } else if (!emailRegExp.test(req.body.email)) {
    res.status(401).json({ message: 'email non conforme' });
  } else {
    // On crypte le mot de passe
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        // Si promesse résolu, on crée un nouvel utilsateur avec le mail passé dans le corps de la requête et le mdp hashé.
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        // On enregistre le nouvel utilisateur dans la base de données
        user
          .save()
          .then(() =>
            res.status(201).json({ message: 'Inscription réussie !' })
          )
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  }
};

exports.login = (req, res, next) => {
  // On cherche si le mail de la requête existe dans la BDD
  User.findOne({ email: req.body.email })
    .then((user) => {
      // Si il n'existe pas, envoie d'erreur unauthorized
      if (!user) {
        res.status(401).json({
          message: "L'email ou le mot de passe sont incorrects",
        });
      } else {
        // Si il existe, on compare le hash du mpd de la requête avec celui de la BDD
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            // Si les mdp sont différents alors envoie d'erreur unauthorized
            if (!valid) {
              res.status(401).json({
                message: "L'email ou le mot de passe sont incorrects",
              });
            } else {
              // Si le mail existe dans la base de donnée + les mdp sont similaires, alors la requête est réussie
              res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', {
                  expiresIn: '24h',
                }),
              });
            }
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
