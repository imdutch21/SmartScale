const Container = require('../model/Container');
const assert = require('assert');
const ApiError = require('../model/ApiError');
const Scale = require('../model/Scale');

function createContainer(request, response, next) {

    let container_weight = request.body.container_weight;
    let max_capacity = request.body.max_capacity;
    let tag_id = request.body.tag_id;
    let scale_id = request.body.scale_id;

    let err;

    try {
        assert(container_weight !== undefined, "container weight not provided");
        assert(max_capacity !== undefined, "maximum capacity is not provided");
        assert(tag_id !== undefined, "no tag id is provided with the container");
        assert(scale_id, "scale_id needs to be provided to make a link");
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
        Scale.findById(scale_id).then((scale) => {
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
    let container_id = request.body.container_id;


    Container.findByIdAndUpdate(container_id, {container_weight:container_weight_new, max_capacity:max_capacity_new})
        .then((container) => {
            response.status(200).json(container).end()

        })
        .catch((error) => {
            next(new ApiError(error.errmsg, 500))
        });
}

module.exports = {
    createContainer,
    updateContainer
}