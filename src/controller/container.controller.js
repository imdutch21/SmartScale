const Container = require('../model/Container');
const assert = require('assert');
const ApiError = require('../model/ApiError');
const User = require('../model/User');

function createContainer(request, response, next) {
    let container_weight = request.body.container_weight;
    let max_capacity = request.body.max_capacity;
    let tag_id = request.body.tag_id;
    console.log(request.body);

    let error;

    try {
        assert(container_weight !== undefined, "container weight not provided");
        assert(max_capacity !== undefined, "maximum capacity is not provided");
        assert(tag_id !== undefined, "no tag id is provided with the container");
    } catch (err) {
        error = err;
        next(new ApiError(err.toString(), 412));
    }
    if (!error) {
        Container.findOne({
            tag_id: tag_id
        })
            .then(new ApiError("This tag is already in use", 412));
    } else {
        let container = new Container({
            container_weight: container_weight,
            max_capacity: max_capacity,
            tag_id: tag_id
        });
        container.save();
    }
}

function updateContainer(request, response, next) {
    let container_weight_new = body.request.container_weight;
    let max_capacity_new = body.request.max_capacity;
    let tag_id = body.request.tag_id;

    console.log(request.body); 

    let error;

    User.findOne({
        tag_id: tag_id
    })
    .then(() => {
        var container_weight = container_weight;
        var max_capacity = max_capacity;
    })

    try {
        assert(container_weight_new == undefined && max_capacity_new == undefined, "no definitions were set");
        assert(container_weight_new == container_weight && max_capacity_new == max_capacity, "new values match previous values");
    } catch (err) {
        error = err;
        next(new ApiError(toString(), 412));
    }
    if (!error) {
        Container.findOne({
            tag_id: tag_id
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

module.exports = { createContainer, updateContainer };