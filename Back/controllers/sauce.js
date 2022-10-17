const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.addNewSauce = (req, res, next) => {
  // On récupére l'objet transmis dans la requête
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; // On supprime ce champ car il va être généré automatiquement par la BDD
  delete sauceObject._userId; // On supprime ce champ pour éviter que l'utilsateur puisse les changer.

  const sauce = new Sauce({
    ...sauceObject, // On lui passe l'objet sans les éléments que nous avons supprimé plus haut
    userId: req.auth.userId, // On lui passe l'userId provenant du token
    likes: 0,
    dislikes: 0,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`, // On lui passe l'url de l'image qu'on va générer grâce à multer
  });
  sauce
    .save()
    .then(() =>
      res.status(201).json({ message: 'Sauce ajoutée avec succés !' })
    )
    .catch((error) => res.status(400).json({ error }));
};

exports.displaySauces = (req, res, next) => {
  // On récupére toutes les sauces de la base donnée
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.openSauce = (req, res, next) => {
  // On récupére la sauce qui possède l'id présent dans les params
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.updateSauce = (req, res, next) => {
  // On regarde si il y a un fichier qui a été transmis
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`, // Si le fichier a été mis à jour alors on recrée l'url de l'image
      }
    : { ...req.body }; // Sinon on récupére l'objet directement dans le corps de la requête
  // Suppression de userId par mesure de sécurité
  delete sauceObject._userId;
  // On récupére l'élément qui possède l'id présent dans les params
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Erreur si l'utilisateur n'est pas celui qui a créé la sauce
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else if (req.file) {
        // Si celui qui a créée la sauce modifie la sauce en mettant à jour l'image
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: 'Objet modifié!' }))
            .catch((error) => res.status(401).json({ error }));
        });
      } else {
        // Si celui qui a créée la sauce modifie la sauce sans mettre à jour l'image

        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  // On récupére l'élément qui possède l'id présent dans les params
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Erreur si l'utilisateur n'est pas celui qui a créé la sauce
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        // Si l'utilsateur est celui qui a créer la sauce
        // on supprime l'objet de la base de donnée
        // tout en supprimant son fichier du dossier image
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Objet supprimé !' });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.likeSauce = (req, res, next) => {
  const likeObject = { ...req.body };

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      let totalDislikes = sauce.dislikes;
      let totalLikes = sauce.likes;
      let usersLikedArray = sauce.usersLiked;
      let usersDislikedArray = sauce.usersDisliked;
      if (
        sauce.usersLiked.indexOf(likeObject.userId) === -1 &&
        sauce.usersDisliked.indexOf(likeObject.userId) === -1
      ) {
        if (likeObject.like === 1) {
          // Si l'utilisateur like, on l'incrémente au nombre de like
          // et on rajoute l'userId dans le tableau des personnes ayant liké
          totalLikes += 1;
          usersLikedArray.push(likeObject.userId);

          Sauce.updateOne(
            { _id: req.params.id },
            {
              sauce,
              _id: req.params.id,
              likes: totalLikes,
              usersLiked: usersLikedArray,
            }
          )
            .then(() => res.status(200).json({ message: 'Element liké !' }))
            .catch((error) => res.status(401).json({ error }));
        } else if (likeObject.like === -1) {
          // Si l'utilisateur dislike, on l'incrémente au nombre de dislike
          // et on rajoute l'userId dans le tableau des personnes ayant disliké
          totalDislikes += 1;
          usersDislikedArray.push(likeObject.userId);

          Sauce.updateOne(
            { _id: req.params.id },
            {
              sauce,
              _id: req.params.id,
              dislikes: totalDislikes,
              usersDisliked: usersDislikedArray,
            }
          )
            .then(() => res.status(200).json({ message: 'Element disliké !' }))
            .catch((error) => res.status(401).json({ error }));
        }
      } else {
        if (
          likeObject.like === 0 &&
          sauce.usersLiked.indexOf(likeObject.userId) !== -1 &&
          sauce.usersDisliked.indexOf(likeObject.userId) === -1
        ) {
          // Si l'utilisateur supprime son like, on le décrémente du nombre de like
          // et on efface l'userId dans le tableau des personnes ayant liké
          totalLikes -= 1;
          usersLikedArray.splice(
            sauce.usersLiked.indexOf(likeObject.userId),
            1
          );

          Sauce.updateOne(
            { _id: req.params.id },
            {
              sauce,
              _id: req.params.id,
              likes: totalLikes,
              usersLiked: usersLikedArray,
            }
          )
            .then(() => res.status(200).json({ message: 'Like annulé' }))
            .catch((error) => res.status(401).json({ error }));
        } else if (
          likeObject.like === 0 &&
          sauce.usersDisliked.indexOf(likeObject.userId) !== -1 &&
          sauce.usersLiked.indexOf(likeObject.userId) === -1
        ) {
          // Si l'utilisateur supprime son dislike, on le décrémente du nombre de dislike
          // et on efface l'userId dans le tableau des personnes ayant disliké
          totalDislikes -= 1;
          usersDislikedArray.splice(
            sauce.usersDisliked.indexOf(likeObject.userId),
            1
          );

          Sauce.updateOne(
            { _id: req.params.id },
            {
              sauce,
              _id: req.params.id,
              dislikes: totalDislikes,
              usersDisliked: usersDislikedArray,
            }
          )
            .then(() => res.status(200).json({ message: 'Dislike annulé' }))
            .catch((error) => res.status(401).json({ error }));
        } else {
          res.status(400).json({
            message:
              "Vous ne pouvez pas liker/disliker une sauce plus d'une fois",
          });
        }
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Sauce Harissa //

//     userId: '',
//     name: 'Sauce Harissa',
//     manufacturer: 'Le phare du Cap Bon',
//     description:
//       'La harissa est une purée de piments rouges du Maghreb utilisée comme condiment ou comme ingrédient. On la retrouve pour la préparation de divers plats, que ce soit pour assaisonner les sauces chaudes ou froides ou les bouillons en y diluant une petite quantité, ou bien pour assaisonner des plats finis comme le couscous ou le kefteji.',
//     mainPepper: 'piment rouge',
//     imageUrl:
//       'https://media.carrefour.fr/medias/1b42bc98406b3e3e830c641d69a707d8/p_540x540/6194049100013-photosite-20150228-095923-0.jpg',
//     heat: 4,
