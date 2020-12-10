module.exports = {
    // Port definitions
    port: process.env.PORT || 3000,

    // Mongo definitions
    mongoUser: process.env.MONGO_USER ,
    mongoPassword: process.env.MONGO_PASSWORD ,
    mongoDatabase: process.env.MONGO_DATABASE,
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret:process.env.GOOGLE_CLIENT_SECRET,
    googleRedirect:process.env.GOOGLE_REDIRECT,
    secret: process.env.SECRET,
    secretKey: process.env.SECRET_KEY

};
