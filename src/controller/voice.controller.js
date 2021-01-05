const ApiError = require('../model/ApiError');
const assert = require('assert');



function handleNewFoodMeasure(params) {

    return {
        prompt: {
            override: false,
            firstSimple: {
                speech: `We successfully measured your ${params} at a total of 200 grams.`,
                text: ""
            }
        }
    }
}

module.exports = {
    googleAsssistent(request, response, next) {

        console.log(request.body);
        let handler = request.body.handler;
        let responseMessage = {};
        let params = request.body.session.params;
        switch (handler) {
            case "NewFoodMeasured": {
                responseMessage = handleNewFoodMeasure(params);
                break;
            }
        }

        responseMessage.session = request.body.session;
        response.status(200).json(responseMessage).end();

    }

}