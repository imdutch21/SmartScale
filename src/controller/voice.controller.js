const ApiError = require('../model/ApiError');
const assert = require('assert');
const {
    decodeToken
} = require('../helper/authentication.helper');
const User = require('../model/User');
const Measurement = require('../model/Measurement');
const Product = require('../model/Product');
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
                    'scale.container.measurement.product.name': {
                        '$regex': '^' + params.Food + '$',
                        '$options': 'i'
                    }
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
                            speech: `I have not found any current inventory for ${params.Food}.`,
                            text: ""
                        }
                    }
                })
            }
        })
    })
}

function checkForUndefinedMeasures(id) {
    return new Promise((resolve, reject) => {
        User.aggregate([{
                "$match": {
                    "_id": mongoose.Types.ObjectId(id)
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
            },
            {
                "$sort": {
                    'scale.container.measurement.measure_date': -1
                }
            }
        ]).then((measurements) => {
            if (measurements.length >= 1) {
                let mappedMeasurements = [];
                for (let i = 0; i < measurements.length; i++) {
                    let id = measurements[i].scale.container._id;
                    if (mappedMeasurements[id]) {
                        mappedMeasurements[id].push(measurements[i].scale.container.measurement)
                    } else {
                        mappedMeasurements[id] = [measurements[i].scale.container.measurement];
                    }
                }
                resolve(mappedMeasurements);
            } else{
                resolve([]);
            }
        })
    })
}

function handleNewFoodMeasure(params, userDetails) {
    if (params.Food) {
        return new Promise((resolve, reject) => {
            checkForUndefinedMeasures(userDetails.payload.user._id).then((mappedMeasurements) => {
                let measurements;
                let length = 0
                console.log(length)

                for (let key in mappedMeasurements) {
                    if (!measurements)
                        measurements = mappedMeasurements[key];
                    length++;
                }
                console.log(mappedMeasurements);
                if (length > 0) {

                    Product.findOne({
                        name: params.Food.toLowerCase()
                    }).then((product) => {
                        if (product) {
                            for (let i = 0; i < measurements.length; i++) {
                                Measurement.findByIdAndUpdate(measurements[i]._id, {
                                    product: product
                                }).then(()=> {
                                    resolve({
                                        prompt: {
                                            override: false,
                                            firstSimple: {
                                                speech: `We have successfully set the contents of your container to ${params.Food} at ${measurements[0].current_volume} ${product.unit}.`,
                                                text: ""
                                            }
                                        }
                                    })
                                });
                            }
                        } else {
                            product = new Product({
                                name: params.Food.toLowerCase(),
                                unit: "grams"
                            });
                            product.save().then(() => {
                                let promises = [];
                                for (let i = 0; i < measurements.length; i++) {
                                    promises.push(Measurement.findByIdAndUpdate(measurements[i]._id, {
                                        product: product
                                    }));
                                }
                                Promise.all(promises).then(()=> {
                                    resolve({
                                        prompt: {
                                            override: false,
                                            firstSimple: {
                                                speech: `We have successfully set the contents of your container to ${params.Food} at ${measurements[0].current_volume} grams.`,
                                                text: ""
                                            }
                                        }
                                    })
                                });
                            })
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
    } else {
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }
}

function handleStartMeasuring(params, userDetails) {
    return new Promise((resolve, reject) => {
        checkForUndefinedMeasures(userDetails.payload.user._id).then((mappedMeasurements) => {
            let measurements;
            let length = 0
            for (let key in mappedMeasurements) {
                if (!measurements)
                    measurements = mappedMeasurements[key];
                length++;
            }
            console.log(mappedMeasurements);
            if (length > 0) {
                if (length == 1) {
                    resolve({
                        prompt: {
                            override: false,
                            firstSimple: {
                                speech: `What product did you measure?`,
                                text: ""
                            }
                        }
                    })
                } else {
                    let date = new Date(measurements[0].measure_date * 1000);
                    resolve({
                        prompt: {
                            override: false,
                            firstSimple: {
                                speech: `There have been multiple new containers that have been measured. What product did you measure at ${date.getHours()}:${date.getMinutes()}`,
                                text: ""
                            }
                        }
                    })
                }
            } else {
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
                    case "StartMeasuring": {
                        promise = handleStartMeasuring(params, payload);
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