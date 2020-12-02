const neo = require('../src/config/neo4j.db');
const mongoose = require('../src/config/mongo.db');
// const user = require('../src/model/User');
// const thread = require('../src/model/Thread');
// const comment = require('../src/model/comment');

before((done) => {
    mongoose.once('open', () => done());
});
beforeEach(function(done) {
    this.timeout(20000);
    const { threads, users, comments } = mongoose.collections;

    const session = neo.session();
    threads.drop(() => {
        comments.drop(() => {
            users.drop(() => {
                session.run("MATCH (n) DETACH DELETE (n)")
                    .then(() => {
                        done(); 
                        session.close();
                    })
                    .catch(() => session.close())
            })
        });
    });
});
