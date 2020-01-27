const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ProductSchema = new Schema({
    image: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
});

mongoose.model('products', ProductSchema);