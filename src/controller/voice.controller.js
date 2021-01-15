const ApiError = require('../model/ApiError');
const assert = require('assert');
const {
    decodeToken
} = require('../helper/authentication.helper');
const User = require('../model/User');
const Measurement = require('../model/Measurement');
const mongoose = require("mongoose");


function handleHowMuchQuestion(params, userDetails) {
    console.log(userDetails)
    return new Promise((resolve, reject) => {
        User.aggregate([{
                "$match": {
                    "_id": mongoose.Types.ObjectId(userDetails.payload.user._id)
                }
            },
            {
                "$lookup": {
                    "from": "scales",
                    "localField": "scales",
                    "foreignField": "_id",
                    "as": "scale"
                }
            },
            {
                $unwind: "$scale"
            },
            {
                "$lookup": {
                    "from": "containers",
                    "localField": "scale.containers",
                    "foreignField": "_id",
                    "as": "scale.container"
                }
            },

            {
                $unwind: "$scale.container"
            },
            {
                "$lookup": {
                    "from": "measurements",
                    "localField": "scale.container.measurements",
                    "foreignField": "_id",
                    "as": "scale.container.measurement"
                }
            },
            {
                $unwind: "$scale.container.measurement"
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "scale.container.measurement.product",
                    "foreignField": "_id",
                    "as": "scale.container.measurement.product"
                }
            },
            {
                "$match": {
                    'scale.container.measurement.product.name': params.Food
                }
            },
            {
                "$sort": {
                    'scale.container.measurement.measure_date': -1
                }
            }
        ]).then((user) => {
            console.log(user);
            if (user.length >= 1) {
                //TODO update measurement with new product, find if product already exist, if multiple measurements of one container set product to all of them, update max capacity
                // Measurement.updateOne({_id:user[0].scale.container.measurement._id})
                resolve({
                    prompt: {
                        override: false,
                        firstSimple: {
                            speech: `You have ${user[0].scale.container.measurement.current_volume} grams of ${params.Food}.`,
                            text: ""
                        }
                    }
                })
            } else {
                resolve({
                    prompt: {
                        override: false,
                        firstSimple: {
                            speech: `We have not found any current inventory for ${params.Food}.`,
                            text: ""
                        }
                    }
                })
            }
        })
    })
}

function handleNewFoodMeasure(params, userDetails) {

    return new Promise((resolve, reject) => {
        User.aggregate([{
            "$match": {
                "_id": mongoose.Types.ObjectId(userDetails.payload.user._id)
            }
        },
        {
            "$lookup": {
                "from": "scales",
                "localField": "scales",
                "foreignField": "_id",
                "as": "scale"
            }
        },
        {
            $unwind: "$scale"
        },
        {
            "$lookup": {
                "from": "containers",
                "localField": "scale.containers",
                "foreignField": "_id",
                "as": "scale.container"
            }
        },

        {
            $unwind: "$scale.container"
        },
        {
            "$lookup": {
                "from": "measurements",
                "localField": "scale.container.measurements",
                "foreignField": "_id",
                "as": "scale.container.measurement"
            }
        },
        {
            $unwind: "$scale.container.measurement"
        },
        {
            "$match": {
                'scale.container.measurement.product': null
            }
        }
    ]).then((user) => {
        console.log(user.length);
        if (user.length >= 1) {
            resolve({
                prompt: {
                    override: false,
                    firstSimple: {
                        speech: `We have successfully measured your ${params.Food} at ${user[0].scale.container.measurement.current_volume} grams.`,
                        text: ""
                    }
                }
            })
        } else {
            console.log("no new measurements have to be done");
            resolve({
                prompt: {
                    override: false,
                    firstSimple: {
                        speech: `There were no new measurements detected. It might take a few seconds before our servers get notified. Please try again soon`,
                        text: ""
                    }
                }
            })
        }
    });
    })
}


module.exports = {
    googleAsssistent(request, response, next) {
        console.log(request.body);
        console.log(request.headers);
        decodeToken(request.headers.authorization, (error, payload) => {
            // console.log(payload);
            if (error) {
                next(new ApiError(error.toString(), 500))
            } else {
                // console.log(request.body);
                let handler = request.body.handler.name;
                // console.log(request.headers)
                let promise = new Promise((resolve, reject) => {
                    resolve({})
                });
                let params = request.body.session.params;
                console.log(handler)
                switch (handler) {
                    case "NewFoodMeasured": {
                        promise = handleNewFoodMeasure(params, payload);
                        break;
                    }
                    case "HowMuch": {
                        console.log("test")
                        promise = handleHowMuchQuestion(params, payload);
                        break;
                    }
                    case "createUser": {
                        // promise = handleHowMuchQuestion(params, payload);
                        break;
                    }
                }
                promise.then((responseMessage) => {
                    responseMessage.session = request.body.session;
                    response.status(200).json(responseMessage).end();
                })

            }
        }, false);
    }
}