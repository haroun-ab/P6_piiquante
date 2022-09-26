const express = require('express');
const auth = require('../middleware/auth');
const sauceCtrl = require('../controllers/sauce');
const router = express.Router();

router.get('/', auth, sauceCtrl.displaySauces);
// router.get('/:id', auth, sauceCtrl.displaySauce);
// router.post('/', auth, sauceCtrl.createSauces);
// router.put('/:id', auth, sauceCtrl.updateSauce);
// router.delete('/:id', auth, sauceCtrl.deleteSauce);
// router.post('/:id/like', auth, sauceCtrl.like);

module.exports = router;
