//
// Authenticatie van JSON Web Token
//


//Het encode van een username naar een Token
const jwt = require('jwt-simple');
const {
    secret,
    secretKey
} = require('../config/config')
const crypto = require('crypto');

function encodeToken(data) {
    let now = new Date();
    now.setMinutes(now.getMinutes() + 10)
    const playload = {
        payload: data,
        expires: now
    };
    return jwt.encode(playload, secretKey)
}


// Het decoden van de Token naar een username
function decodeToken(token, callback, secret) {
    token = token.replace("Bearer ", "")
    if (!secret)
        secret = secretKey;
    try {
        const payload = jwt.decode(token, secret);
        //Check of de Token niet verlopen is.
        callback(null, payload);
    } catch (err) {
        callback(err, null)
    }
}

function hash(string) {

    return crypto.createHmac('sha256', secret)
        .update(string)
        .digest('hex');
}


module.exports = {
    encodeToken,
    decodeToken,
    hash
};