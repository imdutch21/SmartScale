const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContainerSchema = new Schema({
    
    container_weight: {
        type: Number,
    },
    max_capacity: {
        type: Number,
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