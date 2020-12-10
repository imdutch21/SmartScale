const ApiError = require('../model/ApiError');
const assert = require('assert');
const { googleClientID, googleClientSecret, googleRedirect } = require('../config/config');
const { encodeToken, decodeToken } = require('../helper/authentication.helper');

module.exports = {

    authGoogle(request, response, next) {

        let client_id = request.query.client_id;
        let redirect_uri = request.query.redirect_uri;
        let state = request.query.state;
        let scope = request.query.scope;
        let response_type = request.query.response_type;
        let user_locale = request.query.user_locale;
        console.log(request.query)
        try {
            assert(client_id !== undefined, "client_id not provided");
            assert(client_id === googleClientId, "the wrong client_id was provided");
            assert(redirect_uri !== undefined, "redirect_uri not provided");
            assert(redirect_uri.startsWith("https://oauth-redirect.googleusercontent.com/r/") || redirect_uri.startsWith("https://oauth-redirect-sandbox.googleusercontent.com/r/"), "the wrong redirect_uri was provided");
            assert(redirect_uri.endsWith(googleProjectId), "the wrong redirect_uri was provided");
            assert(state !== undefined, "state not provided");
            assert(scope !== undefined, "scope not provided");
            assert(response_type !== undefined, "response_type not provided");
            assert(response_type === "code", "response_type not 'code'");
            assert(user_locale !== undefined, "user_locale not provided");

        } catch (err) {
            next(new ApiError(e.message, 412));
            break;
        }
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let token = encodeToken({ client_id: client_id, ip: ip })
        response.writeHead(301,
            {
                Location: redirect_uri + `?code=${token}&state=${state}`
            }
        );
        response.end();
    },
    refreshToken(request, response, next) {

        let client_id = request.query.client_id;
        let client_secret = request.query.client_secret;
        let grant_type = request.query.grant_type;
        let code = request.query.code;
        let redirect_uri = request.query.redirect_uri;
        console.log(request.query);
        try {
            assert(client_id !== undefined, "client_id not provided");
            assert(client_id === googleClientId, "the wrong client_id was provided");
            assert(client_secret !== undefined, "client_secret not provided");
            assert(client_secret === googleClientSecret, "the wrong client_secret was provided");
            assert(grant_type !== undefined, "grant_type not provided");
            assert(code !== undefined, "code not provided");
            assert(redirect_uri !== undefined, "redirect_uri not provided");
            assert(redirect_uri.startsWith("https://oauth-redirect.googleusercontent.com/r/" + googleClientID) || redirect_uri.startsWith("https://oauth-redirect-sandbox.googleusercontent.com/r/" + googleClientID), "the wrong redirect_uri was provided");

        } catch (err) {
            next(new ApiError(e.message, 412));
            break;
        }
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (grant_type === "authorization_code") {
            decodeToken(token, (err, payload) => {
                if (payload) {
                    if (payload.expires < new Date() && payload.ip === ip) {
                        console.log(code);
                        let token = encodeToken({ user: code, ip: ip })
                        let refresh = encodeToken({ user: code, type: "refresh" })
                        response.json({
                            "token_type": "Bearer",
                            "access_token": "Bearer " + token,
                            "refresh_token": refresh,
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
            decodeToken(token, (err, payload) => {
                if (payload) {
                    let token = encodeToken({ user: code, ip: ip })
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
};
