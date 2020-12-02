// Importing all modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const chalk = require('chalk');

// Importing routes
const userRoutes = require('./route/user.routes');
const threadRoutes = require('./route/thread.routes');
const commentRoutes = require('./route/comment.routes');
const friendshipRoutes = require('./route/friendship.route');

// Importing models
const ApiError = require('./model/ApiError');

// Importing config
const { port } = require('./config/config');

// Initiate connection to MongoDB
const mongo = require('./config/mongo.db');
const driver = require('./config/neo4j.db');


// bodyParser parses the body from a request
let app = express();
app.use(bodyParser.urlencoded({
    'extended': 'true'
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
app.use('/api', userRoutes);
app.use('/api', threadRoutes);
app.use('/api', commentRoutes);
app.use('/api', friendshipRoutes);



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

function shutdown() {
    driver.close();
    console.log(chalk.red('[APP] Application shutting down...'));
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start application listening on provided port
app.listen(port, () => console.log(chalk.green('[SERVER] Server running on port ' + port)));

// Testcases need our app - export it.
module.exports = app;
