const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const CartSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    productId: {
        type: String,
        required: true,
    },
    name: {
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
    image: {
        type: String,
    }
});

mongoose.model('carts', CartSchema);