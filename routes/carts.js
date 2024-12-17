const express = require('express');
const { getCarts, saveCarts } = require('../models/Cart');

const router = express.Router();

// Ruta POST / (Crear un nuevo carrito)
router.post('/', (req, res) => {
    const carts = getCarts();
    const newCart = {
        id: String(carts.length + 1),  // Generación de id único
        products: []
    };
    carts.push(newCart);
    saveCarts(carts);
    res.status(201).json(newCart);
});

// Ruta GET /:cid (Listar productos en el carrito)
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const carts = getCarts();
    const cart = carts.find(c => c.id === cid);
    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
    }
});

// Ruta POST /:cid/product/:pid (Agregar producto al carrito)
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = getCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const existingProduct = cart.products.find(p => p.product === pid);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: pid, quantity: 1 });
    }

    saveCarts(carts);
    res.json(cart.products);
});

// Ruta DELETE /:cid/products/:pid (Eliminar producto del carrito)
router.delete('/:cid/products/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = getCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter(p => p.product !== pid);
    saveCarts(carts);
    res.json({ message: 'Producto eliminado del carrito' });
});

module.exports = router;
