const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images/products'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  
});

const upload = multer({ storage });

const productsController = require('../controllers/productsController');

router.get('/', productsController.index);

router.get('/create', productsController.create);
router.post('/create', upload.single('image'), productsController.store);

router.get('/detail/:id', productsController.detail);

router.get('/edit/:id', productsController.edit);
router.put('/update/:id', upload.single('image'), productsController.update);

router.delete('/delete/:id', productsController.destroy);

module.exports = router;
