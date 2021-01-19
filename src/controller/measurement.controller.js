const Container = require('../model/Container');
const assert = require('assert');
const ApiError = require('../model/ApiError');
const Measurement = require('../model/Measurement');
const mongoose = require('mongoose');

function createMeasurement(request, response, next) {

    let current_volume = request.body.current_volume;
    let measure_date = request.body.measure_date;
    let container_tag_id = request.body.container_tag_id;
    let container_id = request.body.container_id;
    let product_id = request.body.product_id;

    let err;

    try {
        assert(current_volume !== undefined, "current_volume weight not provided");
        assert(measure_date !== undefined, "measure_date is not provided");
        assert(container_id || container_tag_id, "container_id or container_tag_id needs to be provided to make a link");
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
        let match;
        if (container_id)
            match = {
                _id: mongoose.Types.ObjectId(container_id)
            }
        else
            match = {
                tag_id: container_tag_id
            }

        Container.findOne(match).populate({
                path: "measurements"
            }).then((container) => {
                if (container) {
                    if (!product_id && container.measurements.length > 0)
                        measurement.product = container.measurements[container.measurements.length - 1].product
                    container.measurements.push(measurement);
                    if (measurement.current_volume > container.max_capacity) {
                        container.max_capacity = measurement.current_volume;
                    }


                    Promise.all([measurement.save(), container.save()]).then(() => {
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
                    next(new ApiError("no scale found with specified id", 412))
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