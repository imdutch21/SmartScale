module.exports = {
    // Port definitions
    port: process.env.PORT || 3000,

    // Mongo definitions
    mongoHost: process.env.MONGO_HOST || 'ds054479.mlab.com',
    mongoPort: process.env.MONGO_PORT || 54479,
    mongoUser: process.env.MONGO_USER || 'Aron',
    mongoPassword: process.env.MONGO_PASSWORD || 'S4M3V0Lw',
    mongoDatabase: process.env.MONGO_DATABASE || 'studdit',

    //Mongo test definitions
    mongoHostTest: process.env.MONGO_HOST_TEST || 'ds026018.mlab.com',
    mongoPortTest: process.env.MONGO_PORT_TEST || 26018,
    mongoUserTest: process.env.MONGO_USER_TEST || 'bart',
    mongoPasswordTest: process.env.MONGO_PASSWORD_TEST || '23bananen.nl',
    mongoDatabaseTest: process.env.MONGO_DATABASE_TEST || 'studdit_test',

    // Neo4j definitions
    neoHost: process.env.NEO_HOST || 'hobby-pclemdfghkjagbkeojlbafbl.dbs.graphenedb.com',
    neoPort: process.env.NEO_PORT || 24786,
    neoUser: process.env.NEO_USER || 'aron',
    neoPassword: process.env.NEO_PASSWORD || 'b.Ou11TtIxRceq.HZgXCYttGm7LX7cf',
    neoDatabase: process.env.NEO_DATABASE || 'studdit',

    // Neo4j test definitions
    neoHostTest: process.env.NEO_HOST_TEST || 'hobby-chlnhncofhjngbkehbgdbfbl.dbs.graphenedb.com',
    neoPortTest: process.env.NEO_PORT_TEST || 24786,
    neoUserTest: process.env.NEO_USER_TEST || 'administrator',
    neoPasswordTest: process.env.NEO_PASSWORD_TEST || 'b.AfactW24hkqi.LUJ4UjWwCbeFKaHh',
    neoDatabaseTest: process.env.NEO_DATABASE_TEST || 'studdittestdb'
};
