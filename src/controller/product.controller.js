const ApiError = require('../model/ApiError');
const assert = require('assert');
const Product = require('../model/Product');

module.exports = {
    createProduct(request, response, next) {
        let body = request.body;
        let err;
        let name = body.name;
        let unit = body.unit;
        console.log(body)
        try {
            assert(name, "product needs to have a name");
            assert(unit, "product needs to have an unit");
        } catch (e) {
            err = e;
            next(new ApiError(e.toString(), 412));
        }


        if (!err) {
            Product.findOne({
                    name: name.toLowerCase()
                })
                .then((userExists) => {
                    if (userExists) {
                        next(new ApiError("A product with this name has already been registered", 412));
                    } else {
                        let product = new Product({
                            name: name.toLowerCase(),
                            unit: unit
                        });
                        product.save().then(() => {
                            if (!product.isNew) {
                                response.status(200).json(product).end();
                            } else {
                                next(new ApiError("error while saving new user", 501))
                            }
                        })
                    }
                })
                .catch((error) => {
                    next(new ApiError(error.toString(), 500))
                });
        }
    },
    getProduct(request, response, next) {
        let name = request.params.name;
        console.log(name)
        Product.findOne({
                name: name.toLowerCase()
            })
            .then((product) => {
                console.log(product)

                if (!product) {
                    next(new ApiError("no product found with given name", 404));
                } else {
                    response.status(200).json(product).end();
                }
            })
            .catch((error) => {
                next(new ApiError(error.toString(), 500))
            });

    },
    getProducts(request, response, next) {
        Product.find()
            .then((products) => {
                if (!products) {
                    next(new ApiError("no products found", 404));
                } else {
                    response.status(200).json(products).end();
                }
            })
            .catch((error) => {
                next(new ApiError(error.toString(), 500))
            });
    }
}