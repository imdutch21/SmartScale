const neo = require('../config/neo4j.db');
const User = require('../model/User').user;
const Comment = require('../model/Comment').model;
const Thread = require('../model/Thread');
const ApiError = require('../model/ApiError');
const assert = require('assert');


module.exports = {
    createUser(request, response, next) {
        // Assertions
        try {
            assert(typeof (request.body) === 'object', 'Request body must be of type object');
            assert(request.body.username, 'Username is missing from body');
            assert(request.body.password, 'Password is missing from body');
            assert(typeof (request.body.username) === 'string', 'Username property must be of type string');
            assert(typeof (request.body.password) === 'string', 'Password property must be of type string');

            User.findOne({ username: request.body.username })
                .then((user) => {
                    if (user)
                        next(new ApiError("This username already exists", 500))
                    request.body.isActive = true;
                    user = new User(request.body);
                    user.save()
                        .then(() => {
                            assert(!user.isNew, 'User was not saved successfully');
                            const session = neo.session();

                            session.run(
                                'MERGE (:USER { username: $username })',
                                { username: request.body.username })
                                .then(() => {
                                    response.status(200).json(user).end()
                                    session.close();
                                })
                                .catch((error) => {
                                    next(new ApiError(error.toString()), 500)
                                    session.close();
                                });
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
                });
        } catch (e) {
            next(new ApiError(e.message, 412));
        }
    },
    changePassword(request, response, next) {
        // Assertions
        try {
            assert(typeof (request.body) === 'object', 'Request body must be of type object');
            assert(request.body.username, 'Username is missing from body');
            assert(request.body.old_password, 'Old password is missing from body');
            assert(request.body.new_password, 'New password is missing from body');
            assert(typeof (request.body.username) === 'string', 'Username property must be of type string');
            assert(typeof (request.body.old_password) === 'string', 'Old password property must be of type string');
            assert(typeof (request.body.new_password) === 'string', 'New password property must be of type string');

            User.findOne({ username: request.body.username })
                .then((user) => {
                    if (user !== null) {
                        if (user.password === request.body.old_password) {
                            user.set('password', request.body.new_password);
                            user.save()
                                .then(() => response.status(200).json(user).end())
                                .catch((error) => next(new ApiError(error.toString(), 500)));
                        } else {
                            next(new ApiError('Password doesn\'t match specified old password', 401))
                        }
                    } else {
                        next(new ApiError('Username doesn\'t match any user in the database', 404));
                    }
                })
        } catch (e) {
            next(new ApiError(e.message, 412));
        }
    },
    deleteUser(request, response, next) {
        // Assertions
        try {
            assert(typeof (request.body) === 'object', 'Request body must be of type object');
            assert(request.body.username, 'Username is missing from body');
            assert(request.body.password, 'Password is missing from body');
            assert(typeof (request.body.username) === 'string', 'Username property must be of type string');
            assert(typeof (request.body.password) === 'string', 'Password property must be of type string');

            User.findOne({ username: request.body.username })
                .then((user) => {
                    if (user !== null) {
                        if (user.password === request.body.password) {
                            user.set('isActive', false);
                            user.save()
                                .then(() => {
                                    Promise.all([
                                        Comment.updateMany(
                                            { author: request.body.username },
                                            { author: '[deleted]' }),
                                        Thread.updateMany(
                                            { author: request.body.username },
                                            { author: '[deleted]' })
                                    ])
                                        .then(() => response.status(200).json(user).end());
                                })
                                .catch((error) => {
                                    next(new ApiError(error.toString(), 500));
                                })
                        } else {
                            next(new ApiError('Password doesn\'t match specified password', 401))
                        }
                    } else {
                        next(new ApiError('Username doesn\'t match any user in the database', 404));
                    }
                });
        } catch (e) {
            next(new ApiError(e.message, 412));
        }
    }
};
