const ApiError = require('../model/ApiError');
const assert = require('assert');
const {
    decodeToken
} = require('../helper/authentication.helper');
const User = require('../model/User');



function handleNewFoodMeasure(params, userDetails) {
    return new Promise((resolve, reject) => {
        User.aggregate([{
                "$match": {
                    "_id": mongoose.Types.ObjectId(userDetails.user._id)
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
                resolve({
                    prompt: {
                        override: false,
                        firstSimple: {
                            speech: `We successfully measured your ${params.Food} at a total of ${user[0].container.measurement.current_volume} grams.`,
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

function handleHowMuchQuestion(params, userDetails) {
    console.log(params)
    return new Promise((resolve, reject) => {
        resolve({
            prompt: {
                override: false,
                firstSimple: {
                    speech: `You currently have 200 grams of ${params.Food}`,
                    text: ""
                }
            }
        });
    })
}


module.exports = {
    googleAsssistent(request, response, next) {
        console.log(request.body);
        console.log(request.headers);
        decodeToken(request.headers.authorization, (error, payload) => {
            console.log(payload);
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
                switch (handler) {
                    case "NewFoodMeasured": {
                        promise = handleNewFoodMeasure(params, payload);
                        break;
                    }
                    case "HowMuch": {
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
        }, undefined);
    }
}