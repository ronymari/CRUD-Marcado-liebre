const fs = require('fs');
const path = require('path');
const multer = require('multer');

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const toThousand = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/images/products'));
  },
  filename: function (req, file, cb) {
    cb(null, 'image-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const update = (req, res) => {
  const { name, price, discount, description, category } = req.body;
  const productId = +req.params.id;

  const product = products.find((product) => product.id === productId);

  if (!product) {
    return res.status(404).send("Producto no encontrado");
  }

  const newImage = req.file;
  if (newImage) {

    const imagePath = path.join(__dirname, '../../public/images/products', product.image);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    product.image = newImage.originalname;
  }
  product.name = name.trim();
  product.price = +price;
  product.discount = +discount;
  product.category = category;
  product.description = description.trim();

  fs.writeFileSync(productsFilePath, JSON.stringify(products), 'utf-8');

  return res.redirect("/products/detail/" + productId);
};

const destroy = (req, res) => {
  const { id } = req.params;

  const productIndex = products.findIndex((product) => product.id === +id);

  if (productIndex === -1) {
    return res.status(404).send("Producto no encontrado");
  }

  const productToDelete = products[productIndex];

  if (productToDelete.image !== 'default-image.png') {
    const imagePath = path.join(__dirname, '../../public/images/products', productToDelete.image);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    } else {
      console.log(`Imagen no encontrada: ${imagePath}`);
    }
  } else {
    console.log('Intento de eliminar la imagen por defecto.');
   
  }

  products.splice(productIndex, 1);

  fs.writeFileSync(productsFilePath, JSON.stringify(products), 'utf-8');

  return res.redirect('/products');
};

module.exports = {
  index: (req, res) => {
    return res.render('products', {
      products,
      toThousand,
    });
  },

  detail: (req, res) => {
    const product = products.find((product) => product.id === +req.params.id);
    return res.render('detail', {
      ...product,
      toThousand,
    });
  },

  create: (req, res) => {
    return res.render('product-create-form');
  },

  store: (req, res) => {
    const lastID = products[products.length - 1].id;
    const { name, price, discount, description, category } = req.body;


    const newImage = req.file;

    const defaultImagePath = path.join(__dirname, '../../public/images/products/default-image.png');

    const newProduct = {
      id: lastID + 1,
      name: name.trim(),
      price: +price,
      discount: +discount,
      category: category,
      description: description.trim(),
      image: newImage ? newImage.filename : 'default-image.png',
    };

    if (!newImage) {
      // Verificar si la imagen por defecto ya existe en la base de datos
      const defaultImageExists = products.some(product => product.image === 'default-image.png');

      if (!defaultImageExists) {
        // Añadir la imagen por defecto solo si no existe en la base de datos
        console.log('Imagen por defecto asignada');

      }
    }

    products.push(newProduct);

    fs.writeFileSync(productsFilePath, JSON.stringify(products), 'utf-8');

    return res.redirect("/products/detail/" + newProduct.id);
  },

  edit: (req, res) => {
    const product = products.find((product) => product.id === +req.params.id);
    return res.render('product-edit-form', {
      ...product,
    });
  },

  update,
  destroy,
};
