const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    density: {
        type: String,
    },
    experation_date: {
        type: String
    }
});

module.exports = mongoose.model('product', ProductSchema);