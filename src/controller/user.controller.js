const mongoose = require('mongoose');
//const ObjectId = mongoose.Types.ObjectId;?

const User = require('../model/User')
const ApiError = require('../model/ApiError');
const assert = require('assert');


//getUser
//deleteUser

module.exports = {
    createUser(request, response, next) {
        let body = request.body;
        let err;

        let name = body.name;
        let email = body.email;
        try {
            assert(name, "user needs to have a name");
            assert(email, "user needs to have an email");
        } catch (e) {
            err = e;
            next(new ApiError(e.toString(), 412));
        }
        if (!err) {
            User.findOne({
                    email: email
                })
                .then((userExists) => {
                    if (userExists) {
                        next(new ApiError("An user with this email is already registered", 412));
                    } else {
                        let user = new User({
                            name: name,
                            email: email
                        });
                        user.save().then(() => {
                            if (!user.isNew) {
                                response.status(200).json(user).end();
                            } else {
                                next(new ApiError("error while saving new user", 501))
                            }
                        })
                    }
                })
                .catch((error) => {
                    var errorMessage;
                    switch (error.code) {
                        case 11000:
                            errorMessage = "This username already exists";
                            break;
                        default:
                            errorMessage = error.errmsg;
                            break;
                    }

                    next(new ApiError(errorMessage, 500))
                });
        }
    },
    updateUser(request, response, next) {
        response.send('test update user function');
    },
    getUser(request, response, next) {
        let id = request.params.userId;
        console.log(id);
        User.findById(id).populate({
            path: "scales",
            populate: {
                path: "containers",
                populate: {
                    path: "measurements",
                    populate: {
                        path: "product",
                    }
                }
            }
        }).then((foundUser) => {
            if (foundUser)
                response.status(200).json(foundUser).end();
            else
                next(new ApiError("user not found", 404))
        }).catch((error) => {

            next(new ApiError(error.toString(), 500))
        });
    }
};