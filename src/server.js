// Importing all modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const cors = require('cors');

// Importing routes
const userRoute = require('./route/user.route');
const authRoute = require('./route/auth.route');
const voiceRoute = require('./route/voice.route');
const scaleRoute = require('./route/scale.route');
const productRoute = require('./route/product.route');
const measurementRoute = require('./route/measurement.route');
const containerRoute = require('./route/container.route');

// Importing models
const ApiError = require('./model/ApiError');

// Importing config
const {
    port
} = require('./config/config');

// Initiate connection to MongoDB
const mongo = require('./config/mongo.db');

// bodyParser parses the body from a request
let app = express();
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));

let whitelist = ["*"]
app.use(cors({
    origin: function (origin, callback) {
        // console.log(origin)
        // if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        // } else {
        //     callback(new Error('Not allowed by CORS'))
        // }
    },
    credentials: true
}));


// parse application/vnd.api+json as json
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));

// Install Morgan as logger
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Defining routes
app.use('/api', authRoute);
app.use('/api', voiceRoute);
app.use('/api', userRoute);
app.use('/api', scaleRoute);
app.use('/api', productRoute);
app.use('/api', measurementRoute);
app.use('/api', containerRoute);


// Postprocessing; catch all non-existing endpoint requests
app.use('*', function (req, res, next) {
    const error = new ApiError('Non-existing endpoint', 404);
    next(error);
});

// Catch-all error handlers
app.use((err, req, res, next) => {
    //console.log(chalk.red(err));
    res.status((err.code || 404)).json(err).end();
});

// const User = require('./model/User').user;
// let u1 = new User({username:"test", password:"test"});
// u1.save((err, u) => {
//     if (err) return console.error(err);
//     console.log(u)
//   });

// User.findOne((err, users) =>{
//     console.log(users);
// })

function shutdown() {
    console.log(chalk.red('[APP] Application shutting down...'));
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start application listening on provided port
app.listen(port, () => console.log(chalk.green('[SERVER] Server running on port ' + port)));

// Testcases need our app - export it.
module.exports = app;