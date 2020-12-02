const neo = require('../config/neo4j.db');
const User = require('../model/User').user;
const ApiError = require('../model/ApiError');
const assert = require('assert');

module.exports = {
    createFriendship(request, response, next) {
        try {
            assert(typeof (request.body) === 'object', 'Request body must be of type object');
            assert(request.body.user1, 'user1 is missing from body');
            assert(request.body.user2, 'user2 is missing from body');
            assert(typeof (request.body.user1) === 'string', 'user1 property must be of type string');
            assert(typeof (request.body.user2) === 'string', 'user2 property must be of type string');
            assert(request.body.user1 !== request.body.user2, 'user1 and user2 can\'t be the same person');

            User.findOne({ username: request.body.user1 })
                .then((user) => {
                    if (user !== null) {
                        User.findOne({ username: request.body.user2 })
                            .then((user2) => {
                                if (user2 !== null) {
                                    const session = neo.session();
                                    session.run(
                                        'MATCH (u1:USER { username: $user1}), (u2:USER { username: $user2}) ' +
                                        'MERGE (u1)-[:FRIENDS_WITH]-(u2)',
                                        {
                                            user1: request.body.user1,
                                            user2: request.body.user2
                                        })
                                        .then(result => {
                                            session.close();
                                            //TODO wat is beste manier voor terug geven dit?
                                            response.status(200).json(new ApiError("Friendship was succesfully added", 200)).end();
                                        })
                                        .catch((error) => {
                                            session.close();
                                            next(new ApiError(error.toString(), 500));
                                        });
                                } else {
                                    next(new ApiError('User2 doesn\'t match any user in the database', 404));
                                }
                            });

                    } else {
                        next(new ApiError('User1 doesn\'t match any user in the database', 404));
                    }
                });
        } catch (e) {
            next(new ApiError(e.message, 412));
        }
    },
    deleteFriendship(request, response, next) {
        try {
            assert(typeof (request.body) === 'object', 'Request body must be of type object');
            assert(request.body.user1, 'user1 is missing from body');
            assert(request.body.user2, 'user2 is missing from body');
            assert(typeof (request.body.user1) === 'string', 'user1 property must be of type string');
            assert(typeof (request.body.user2) === 'string', 'user2 property must be of type string');
            assert(request.body.user1 !== request.body.user2, 'user1 and user2 can\'t be the same person');

            User.findOne({ username: request.body.user1 })
                .then((user) => {
                    if (user !== null) {
                        User.findOne({ username: request.body.user2 })
                            .then((user2) => {
                                if (user2 !== null) {
                                    const session = neo.session();
                                    session.run(
                                        'MATCH (u1:USER { username: $user1})-[F:FRIENDS_WITH]-(u2:USER { username: $user2}) ' +
                                        'DELETE F',
                                        {
                                            user1: request.body.user1,
                                            user2: request.body.user2
                                        })
                                        .then((result) => {
                                            session.close();
                                            response.status(200).json(new ApiError("Friendship was succesfully ended", 200)).end();
                                        })
                                        .catch((error) => {
                                            neo.close();
                                            next(new ApiError(error.toString(), 500));
                                        });
                                } else {
                                    next(new ApiError('User2 doesn\'t match any user in the database', 404));
                                }
                            });

                    } else {
                        next(new ApiError('User1 doesn\'t match any user in the database', 404));
                    }
                });
        } catch (e) {
            next(new ApiError(e.message, 412));
        }
    }
};
