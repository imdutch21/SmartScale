const mongoose = require('mongoose');
//const ObjectId = mongoose.Types.ObjectId;?

const Scale = require('../model/Scale');
const Container = require('../model/Container')



module.exports = {
createScale(request, response, next) {
    response.send('test create scale function');
},
updateScale(request, response, next) {
    response.send('test update scale function');
}};