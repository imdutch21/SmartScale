const ApiError = require('../model/ApiError');
const assert = require('assert');
const {
    googleClientID,
    googleClientSecret
} = require('../config/config');
const {
    encodeToken,
    decodeToken
} = require('../helper/authentication.helper');
const fetch = require('node-fetch');
const jwt = require('jwt-simple');

const User = require('../model/User');


module.exports = {
    authGoogle(request, response, next) {
        let client_id = request.query.client_id;
        let redirect_uri = request.query.redirect_uri;
        let state = request.query.state;
        let scope = request.query.scope;
        let response_type = request.query.response_type;
        let user_locale = request.query.user_locale;
        console.log(request.body)
        let error;
        try {
            assert(client_id !== undefined, "client_id not provided");
            assert(client_id === googleClientID, "the wrong client_id was provided");
            assert(redirect_uri !== undefined, "redirect_uri not provided");
            assert(redirect_uri.startsWith("https://oauth-redirect.googleusercontent.com/r/") || redirect_uri.startsWith("https://oauth-redirect-sandbox.googleusercontent.com/r/"), "the wrong redirect_uri was provided");
            assert(redirect_uri.endsWith(googleClientID), "the wrong redirect_uri was provided");
            assert(state !== undefined, "state not provided");
            assert(scope !== undefined, "scope not provided");
            assert(response_type !== undefined, "response_type not provided");
            assert(response_type === "code", "response_type not 'code'");
            assert(user_locale !== undefined, "user_locale not provided");
        } catch (err) {
            error = err;
            next(new ApiError(err.message, 412));
        }
        if (!error) {
            let ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
            let token = encodeToken({
                client_id: client_id,
                ip: ip
            })
            console.log(token);
            redirect = redirect_uri + `#access_token=${token}&token_type=bearer&state=${state}`
            console.log(redirect);
            response.writeHead(301, {
                Location: redirect
            });
            response.end();
        }
    },
    refreshToken(request, response, next) {

        let grant_type = request.body.grant_type;
        let intent = request.body.intent;
        let assertion = request.body.assertion;
        let consent_code = request.body.consent_code;
        let scope = request.body.scope;
        console.log(request.body);
        let error;
        try {
            assert(grant_type !== undefined, "client_id not provided");
            assert(grant_type === "urn:ietf:params:oauth:grant-type:jwt-bearer", "the wrong grant_type was provided");
            assert(intent !== undefined, "intent not provided");
            assert(intent === "get", "intent was not get");
            assert(assertion !== undefined, "assertion not provided");
        } catch (err) {
            error = err;
            next(new ApiError(err.message, 412));
        }
        if (!error) {
            fetch("https://www.googleapis.com/oauth2/v1/certs").then(res => res.json()).then(body => {

                const token = assertion;
                const certificates = body;
                let decoded = undefined
                try{
                    decoded = jwt.decode(token, certificates[Object.keys(certificates)[0]]);
                    console.log('Payload:', decoded);

                } catch (error){
                    try{
                        decoded = jwt.decode(token, certificates[Object.keys(certificates)[1]]);
                        console.log('Payload:', decoded);
                    } catch(e){
                        response.status(500).end();
                        console.log("failed to decode")
                    }
                }
                User.findOne({email:decoded.email}).then((user)=>{
                    decoded.user = user;
                    if(decoded){
                        response.status(200).json({
                            access_token:encodeToken(decoded),
                            token_type: "Bearer",
                            "expires_in": 600
                        }).end();
                    } else {
                        response.status(500).end();
                    }
                });

            }).catch(e => {
                response.status(500).end();
            })
        }
    }
};