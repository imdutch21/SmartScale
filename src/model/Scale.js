const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScaleSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },
    containers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'container'
    }]
});

module.exports = mongoose.model('scale', ScaleSchema);