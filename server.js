const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

// Crear servidor Express
const app = express();
const server = app.listen(8080, () => console.log('Servidor corriendo en http://localhost:8080'));

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tienda')
    .then(() => {
        console.log('Conexión a MongoDB exitosa');
    })
    .catch((err) => {
        console.error('Error al conectar a MongoDB:', err);
    });

// Esquema y modelo de Producto
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, default: 'General' },
    available: { type: Boolean, default: true }
});

const Product = mongoose.model('Product', productSchema);

// Configuración de socket.io
const io = socketIo(server);

// Ruta principal
app.get('/', async (req, res) => {
    try {
        const products = await Product.find().lean(); // Obtener productos desde la BD
        res.render('home', { products });
    } catch (error) {
        res.status(500).send('Error al cargar productos');
    }
});

// Ruta de productos en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find().lean(); // Obtener productos desde la BD
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).send('Error al cargar productos en tiempo real');
    }
});

// Conexión a WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Emitir productos al cliente
    Product.find().then(products => {
        socket.emit('products', products);
    });

    // Evento para agregar un producto
    socket.on('addProduct', async (productData) => {
        try {
            const product = new Product(productData);
            await product.save();
            const products = await Product.find();
            io.sockets.emit('products', products); // Emitir los productos actualizados a todos los clientes
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    });

    // Evento para eliminar un producto
    socket.on('deleteProduct', async (productId) => {
        try {
            await Product.findByIdAndDelete(productId);
            const products = await Product.find();
            io.sockets.emit('products', products); // Emitir los productos actualizados a todos los clientes
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    });
});

