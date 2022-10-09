const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  try {
    // On récupére le token correspondant au 2e élément de 'authorization' dans les headers
    const token = req.headers.authorization.split(' ')[1];
    // On décode le token pour récupérer l'userId stocké dans celui-ci
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    // On créer un objet contenant l'userId qui sera transmis aux autres routes
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
