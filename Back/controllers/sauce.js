exports.displaySauces = (req, res) => {
  const ModelsSauce = [
    {
      userId: '',
      name: 'Sauce Harissa',
      manufacturer: 'Le phare du Cap Bon',
      description:
        'La harissa est une purée de piments rouges du Maghreb utilisée comme condiment ou comme ingrédient. On la retrouve pour la préparation de divers plats, que ce soit pour assaisonner les sauces chaudes ou froides ou les bouillons en y diluant une petite quantité, ou bien pour assaisonner des plats finis comme le couscous ou le kefteji.',
      mainPepper: 'piment rouge',
      imageUrl:
        'https://media.carrefour.fr/medias/1b42bc98406b3e3e830c641d69a707d8/p_540x540/6194049100013-photosite-20150228-095923-0.jpg',
      heat: 4,
      likes: 10,
      dislikes: 4,
      usersLiked: 'String',
      usersDisliked: 'String',
    },
  ];
  res.status(200).json(ModelsSauce);
};
