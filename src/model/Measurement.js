const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MeasurementSchema = new Schema({
    
    current_volume: {
        type: Number,
        required: true
    },
    measure_date: {
        type: String,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    }
});

module.exports = mongoose.model('measurement', MeasurementSchema);