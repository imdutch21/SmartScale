const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContainerSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    container_weight: {
        type: Number,
        required: true
    },
    max_capacity: {
        type: Number,
        required: true
    },
    tag_id: {
        type: String,
        required: true
    },
    measurements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'measurement'
    }]
});

module.exports = mongoose.model('container',ContainerSchema);