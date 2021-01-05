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

module.exports = {
    authGoogle(request, response, next) {
        let client_id = request.query.client_id;
        let redirect_uri = request.query.redirect_uri;
        let state = request.query.state;
        let scope = request.query.scope;
        let response_type = request.query.response_type;
        let user_locale = request.query.user_locale;
        console.log(request.query)
        let error;
        console.log(googleClientID)
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
            redirect = redirect_uri + `?code=${token}&state=${state}`
            console.log(redirect);
            response.writeHead(301, {
                Location: redirect
            });
            response.end();
        }
    },
    refreshToken(request, response, next) {

        let client_id = request.query.client_id;
        let client_secret = request.query.client_secret;
        let grant_type = request.query.grant_type;
        let code = request.query.code;
        let redirect_uri = request.query.redirect_uri;
        console.log(request.query);
        let error;
        try {
            assert(client_id !== undefined, "client_id not provided");
            assert(client_id === googleClientID, "the wrong client_id was provided");
            assert(client_secret !== undefined, "client_secret not provided");
            assert(client_secret === googleClientSecret, "the wrong client_secret was provided");
            assert(grant_type !== undefined, "grant_type not provided");
            assert(code !== undefined, "code not provided");
            assert(redirect_uri !== undefined, "redirect_uri not provided");
            assert(redirect_uri.startsWith("https://oauth-redirect.googleusercontent.com/r/" + googleClientID) || redirect_uri.startsWith("https://oauth-redirect-sandbox.googleusercontent.com/r/" + googleClientID), "the wrong redirect_uri was provided");

        } catch (err) {
            error = err;
            next(new ApiError(err.message, 412));
        }
        if (!error) {
            let ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
            if (grant_type === "authorization_code") {
                decodeToken(code, (err, payload) => {
                    if (payload) {

                        if (Date.parse(payload.expires) > new Date() && payload.payload.ip === ip) {
                            console.log(code);
                            let token = encodeToken({
                                user: code,
                                ip: ip
                            })
                            let refresh = encodeToken({
                                user: code,
                                type: "refresh"
                            })
                            response.json({
                                "token_type": "Bearer",
                                "access_token": "Bearer " + token,
                                "refresh_token": "Bearer " + refresh,
                                "expires_in": 600
                            }).end();
                        } else {
                            next(new ApiError("invalid_grant", 400))
                        }
                    } else {
                        next(new ApiError("invalid_grant", 400))
                    }
                })
            } else if (grant_type === "refresh_token") {
                decodeToken(code, (err, payload) => {
                    if (payload) {
                        let token = encodeToken({
                            user: code,
                            ip: ip
                        })
                        response.json({
                            "token_type": "Bearer",
                            "access_token": "Bearer " + token,
                            "expires_in": 600
                        }).end();
                    } else {
                        next(new ApiError("invalid_grant", 400))
                    }
                })
            } else {
                next(new ApiError("invalid_grant", 400))
            }
        }
    }
};