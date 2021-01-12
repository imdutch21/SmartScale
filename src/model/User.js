const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    scales: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'scale'
    }]
});

module.exports = mongoose.model('user', UserSchema);