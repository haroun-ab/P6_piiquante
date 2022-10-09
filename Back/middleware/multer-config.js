const multer = require('multer');

// Dictionnaire de mime type
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const storage = multer.diskStorage({
  // On indique à multer qu'il doit enregistrer les fichiers dans le dossier ./images
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // On indique quel nom doit donner multer au fichier enregsitrer
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype]; // On défini l'extension de l'image
    const name = file.originalname
      .split('.' + extension)
      .join('')
      .split(' ')
      .join('_'); // On remplace les espaces dans le nom d'origine du fichier par des underscores

    callback(null, name + Date.now() + '.' + extension); // Exemple : "sauce_harissa1664204539.jpg"
  },
});

module.exports = multer({ storage }).single('image'); // Une seule image est attendue
