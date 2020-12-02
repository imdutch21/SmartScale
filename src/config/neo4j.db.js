// Importing modules
const neo4j = require('neo4j-driver').v1;
const chalk = require('chalk');
const { neoHost, neoPort, neoUser, neoPassword, neoHostTest, neoPortTest, neoUserTest, neoPasswordTest, isTestingEnvironment } = require('./config');

// Print connection attempt line
console.log(chalk.yellow(`[NEO4J] Setup connection pool for NEO4J on ${neoHost}:${neoPort}...`));

// Instantiate connection pool for Neo4j
let driver;
if (process.env.NODE_ENV === 'test') {
    driver = neo4j.driver(`bolt://${neoHostTest}:${neoPortTest}`, neo4j.auth.basic(neoUserTest, neoPasswordTest));
} else {
    driver = neo4j.driver(`bolt://${neoHost}:${neoPort}`, neo4j.auth.basic(neoUser, neoPassword));
}

module.exports = driver;

