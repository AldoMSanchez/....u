const express = require('express');
const { getProducts, saveProducts } = require('../models/Product');

const router = express.Router();

// Ruta GET / (Listar todos los productos)
router.get('/', (req, res) => {
    const products = getProducts();
    const limit = parseInt(req.query.limit);  // Obtener parámetro limit de la query
    if (limit) {
        return res.json(products.slice(0, limit));
    }
    res.json(products);
});

// Ruta GET /:pid (Obtener un producto por id)
router.get('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = getProducts();
    const product = products.find(p => p.id === pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// Ruta POST / (Crear un nuevo producto)
router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
    const products = getProducts();
    const newProduct = {
        id: String(products.length + 1), // Generación de id único
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails
    };
    products.push(newProduct);
    saveProducts(products);
    res.status(201).json(newProduct);
});

// Ruta PUT /:pid (Actualizar un producto)
router.put('/:pid', (req, res) => {
    const { pid } = req.params;
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    const products = getProducts();
    const productIndex = products.findIndex(p => p.id === pid);

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const updatedProduct = { ...products[productIndex], title, description, code, price, stock, category, thumbnails };
    products[productIndex] = updatedProduct;
    saveProducts(products);
    res.json(updatedProduct);
});

// Ruta DELETE /:pid (Eliminar un producto)
router.delete('/:pid', (req, res) => {
    const { pid } = req.params;
    let products = getProducts();
    products = products.filter(p => p.id !== pid);
    saveProducts(products);
    res.status(204).send();
});

module.exports = router;
