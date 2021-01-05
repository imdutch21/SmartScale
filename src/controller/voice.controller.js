const ApiError = require('../model/ApiError');
const assert = require('assert');


module.exports = {
    googleAsssistent(request, response, next) {

        console.log(request.body);
        response.status(200).json({
            session: request.body.session,
            prompt: {
                override: false,
                firstSimple: {
                    speech: "Hello World.",
                    text: ""
                }
            }
        }).end();

    }

}