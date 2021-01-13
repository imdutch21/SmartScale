const mongoose = require('mongoose');
const Container = require('../model/Container');
const assert = require('assert');
const ApiError = require('../model/ApiError');
const Scale = require('../model/Scale');

function createContainer(request, response, next) {

    let container_weight = request.body.container_weight;
    let max_capacity = request.body.max_capacity;
    let tag_id = request.body.tag_id;
    let scaleId = request.body.scaleId;

    let err;

    try {
        assert(container_weight !== undefined, "container weight not provided");
        assert(max_capacity !== undefined, "maximum capacity is not provided");
        assert(tag_id !== undefined, "no tag id is provided with the container");
        assert(scaleId, "scaleId needs to be provided to make a link");
    } catch (e) {
        err = e;
        next(new ApiError(e.toString(), 412));
    }
    if (!err) {
        let container = new Container({
            container_weight: container_weight,
            max_capacity: max_capacity,
            tag_id: tag_id
        });
        Scale.findById(scaleId).then((scale) => {
            if (scale) {
                scale.containers.push(container);
                Promise.all([container.save(), scale.save()]).then(() => {
                    if (!container.isNew) {
                        response.status(200).json(container).end()
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

function updateContainer(request, response, next) {
    let container_weight_new = request.body.container_weight;
    let max_capacity_new = request.body.max_capacity;
    let ContainerId = request.body.scaleId;

    let error;

    Container.findById(scaleId).then(() => {
            var container_weight = container_weight;
            var max_capacity = max_capacity;
        })

    try {
        // assert(container_weight_new == undefined && max_capacity_new == undefined, "no definitions were set");
        // assert(container_weight_new == container_weight && max_capacity_new == max_capacity, "new values match previous values");
    } catch (err) {
        error = err;
        next(new ApiError(toString(), 412));
    }
    if (!error) {
        Container.findOne({
            scaleId: scaleId
        })
            .then(() => {
                if (container_weight_new !== undefined) {
                    container_weight = container_weight_new
                }
                if (max_capacity_new !== undefined) {
                    max_capacity_new = max_capacity
                }
            });
    }
}

module.exports = { createContainer, updateContainer }