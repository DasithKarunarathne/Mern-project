// models/Product.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stockQuantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String // Store the path to the image
    }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;