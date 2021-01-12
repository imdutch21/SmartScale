const mongoose = require('mongoose');
const ApiError = require('../model/ApiError');

const Scale = require('../model/Scale');
const User = require('../model/User')
const assert = require('assert');



module.exports = {
    createScale(request, response, next) {
        let body = request.body;
        let err;

        let name = body.name;
        let userId = body.userId;
        try {
            assert(name, "scale needs to have a name");
            assert(userId, "userId needs to be provided to make a link");
        } catch (e) {
            err = e;
            next(new ApiError(e.toString(), 412));
        }
        if (!err) {
            let scale = new Scale({
                name: name
            });
            User.findById(userId).then((user) => {
                    if (user) {
                        user.scales.push(scale);
                        Promise.all([scale.save(), user.save()]).then(() => {
                                if (!scale.isNew) {
                                    response.status(200).json(scale).end()
                                } else {
                                    next(new ApiError("something whent worng saving the scale", 501))
                                }
                            })
                            .catch((error) => {
                                next(new ApiError(error.toString(), 500))
                            });
                    } else {
                        next(new ApiError("no user found with the specified id", 412))
                    }
                })
                .catch((error) => {
                    next(new ApiError(error.errmsg, 500))
                });
        }
    },
    updateScale(request, response, next) {
        response.send('test update scale function');
    }
};