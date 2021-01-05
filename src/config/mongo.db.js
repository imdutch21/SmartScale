// Importing modules
const mongoose = require('mongoose');
const {mongoUser, mongoPassword, mongoDatabase, mongoURL } = require('./config');
const chalk = require('chalk');

// Gebruik es6 promises ipv mongoose mpromise
mongoose.Promise = global.Promise;
chalk.green("starting mongo")

const uri = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoURL}/${mongoDatabase}?retryWrites=true&w=majority`;
console.log(uri);
mongoose.connect(uri, {useNewUrlParser: true});

// Register to events of the connection
let connection = mongoose.connection
    .once('open', () => console.log(chalk.green(`[MONGO] Connected to Mongo on `)))
    .on('error', (error) => console.log(chalk.red('[MONGO] ' + error.toString())));





module.exports = connection;
