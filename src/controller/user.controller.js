const mongoose = require('mongoose');
//const ObjectId = mongoose.Types.ObjectId;?

const User = require('../model/User')
const Scale = require('../model/Scale');
const ApiError = require('../model/ApiError');


//getUser
//deleteUser

module.exports = {  
    createUser(request, response, next) {
        let body = request.body;
        let err;
        try {

        } catch(e){
            err = e;
            next(new ApiError(e, 412));
        }
        if(!err ){

        }
    },
    updateUser(request, response, next) {
        response.send('test update user function');
    }
};