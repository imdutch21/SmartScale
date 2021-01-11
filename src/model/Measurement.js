const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MeasurementSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    current_volume: {
        type: BigInt,
    },
    measure_date: {
        type: String,
    },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }]
});

module.exports = mongoose.model('measurement', MeasurementSchema);