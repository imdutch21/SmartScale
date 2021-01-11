const mongoose = require('mongoose');
//const ObjectId = mongoose.Types.ObjectId;?

const Scale = require('../../../Smart_Scale/src/models/Scale');
const Container = require('../model/Container')

createScale = function(request, response, next) {
    response.send('test create scale function');
}
updateScale = function(request, response, next) {
    response.send('test update scale function');
}

module.exports = {createScale, updateScale};