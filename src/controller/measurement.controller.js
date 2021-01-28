const Container = require('../model/Container');
const assert = require('assert');
const ApiError = require('../model/ApiError');
const Measurement = require('../model/Measurement');
const mongoose = require('mongoose');
const Scale = require('../model/Scale');

function createMeasurement(request, response, next) {

    let current_volume = request.body.current_volume;
    let measure_date = request.body.measure_date;
    let container_tag_id = request.body.container_tag_id;
    let product_id = request.body.product_id;
    let scale_id = request.body.scale_id;

    let err;

    try {
        assert(current_volume !== undefined, "current_volume weight not provided");
        assert(measure_date !== undefined, "measure_date is not provided");
        assert(container_tag_id, "container_tag_id needs to be provided to make a link");
        assert(scale_id, "scale_id needs to be provided to make a link");
    } catch (e) {
        err = e;
        next(new ApiError(e.toString(), 412));
    }
    if (!err) {
        let measurement = new Measurement({
            current_volume: current_volume,
            measure_date: measure_date
        });
        if (product_id)
            measurement.product = mongoose.Types.ObjectId(product_id)

        Container.findOne({
                tag_id: container_tag_id
            }).populate({
                path: "measurements"
            }).then((foundContainer) => {
                if (foundContainer) {
                    measurement.current_volume = current_volume - foundContainer.container_weight;
                    if (!product_id && foundContainer.measurements.length > 0)
                        measurement.product = foundContainer.measurements[foundContainer.measurements.length - 1].product
                    foundContainer.measurements.push(measurement);
                    if (measurement.current_volume > foundContainer.max_capacity) {
                        foundContainer.max_capacity = measurement.current_volume - foundContainer.container_weight;
                    }
                    Promise.all([measurement.save(), foundContainer.save()]).then(() => {
                            if (!measurement.isNew) {
                                response.status(200).json(measurement).end()
                            } else {
                                next(new ApiError("something went wrong while saving the container", 501))
                            }
                        })
                        .catch((error) => {
                            next(new ApiError(error.toString(), 500))
                        });
                } else {
                    if (container_tag_id) {
                        console.log("Made: " + container_tag_id)
                        let container = new Container({
                            tag_id: container_tag_id,
                            container_weight: 0,
                            max_capacity: measurement.current_volume
                        })
                        container.measurements.push(measurement);
                        Scale.findById(scale_id).then((scale) => {
                            scale.containers.push(container);
                            Promise.all([measurement.save(), container.save(), scale.save()]).then(() => {
                                    if (!measurement.isNew) {
                                        response.status(200).json(measurement).end()
                                    } else {
                                        next(new ApiError("something went wrong while saving the container", 501))
                                    }
                                })
                                .catch((error) => {
                                    next(new ApiError(error.toString(), 500))
                                });
                        })
                    } else {
                        next(new ApiError("no scale found with specified id", 412))
                    }
                }
            })
            .catch((error) => {
                next(new ApiError(error.errmsg, 500))
            });
    }
}

module.exports = {
    createMeasurement
}