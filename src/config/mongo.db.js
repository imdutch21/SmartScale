// Importing modules
const mongoose = require('mongoose');
const { mongoHost, mongoPort, mongoUser, mongoPassword, mongoDatabase, mongoHostTest, mongoPortTest, mongoUserTest, mongoPasswordTest, mongoDatabaseTest } = require('./config');
const chalk = require('chalk');

// Gebruik es6 promises ipv mongoose mpromise
mongoose.Promise = global.Promise;
// Creating connectionString based on location
/*const connectionString = process.env.NODE_ENV === 'production' ?
    'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoHost + ':' + mongoPort + '/' + mongoDatabase :
    'mongodb://localhost/' + mongoDatabase;*/

let connectionString;
//Checks if we are running tests or just running the program
console.log(chalk.yellow(`[SERVER] Running in ${process.env.NODE_ENV} mode`));
if (process.env.NODE_ENV === 'test') {
    console.log(chalk.yellow('Running tests...'));
    console.log(chalk.yellow(`[MONGO] Attempting connection to Mongo on ${mongoHostTest}:${mongoPortTest}/${mongoDatabaseTest}...`));
    connectionString = 'mongodb://' + mongoUserTest + ':' + mongoPasswordTest + '@' + mongoHostTest + ':' + mongoPortTest + '/' + mongoDatabaseTest;
} else {
    console.log(chalk.yellow(`[MONGO] Attempting connection to Mongo on ${mongoHost}:${mongoPort}/${mongoDatabase}...`));
    connectionString = 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoHost + ':' + mongoPort + '/' + mongoDatabase;
}

// Connect to MongoDB
mongoose.connect(connectionString, {
    useCreateIndex: true,
    useNewUrlParser: true
});

// Register to events of the connection
let connection = mongoose.connection
    .once('open', () => console.log(chalk.green(`[MONGO] Connected to Mongo on ${process.env.NODE_ENV === 'test' ? mongoHostTest : mongoHost}:${process.env.NODE_ENV === 'test' ? mongoPortTest : mongoPort}/${process.env.NODE_ENV === 'test' ? mongoDatabaseTest : mongoDatabase}`)))
    .on('error', (error) => console.log(chalk.red('[MONGO] ' + error.toString())));

module.exports = connection;
