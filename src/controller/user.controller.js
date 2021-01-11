const mongoose = require('mongoose');
//const ObjectId = mongoose.Types.ObjectId;?

const User = require('../models/User')
const Scale = require('../models/Scale');

createUser = function(request, response, next) {
    response.send('test create_user function');
}
updateUser = function(request, response, next) {
    response.send('test update user function');
}
//getUser
//deleteUser

module.exports = {createUser, updateUser};