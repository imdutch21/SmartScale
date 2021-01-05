const ApiError = require('../model/ApiError');
const assert = require('assert');



function handleNewFoodMeasure(params) {
    console.log(params)
    return {
        prompt: {
            override: false,
            firstSimple: {
                speech: `We successfully measured your ${params.Food} at a total of 200 grams.`,
                text: ""
            }
        }
    }
}

module.exports = {
    googleAsssistent(request, response, next) {

        console.log(request.body);
        let handler = request.body.handler.name;
        console.log(handler)
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