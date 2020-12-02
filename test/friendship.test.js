const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const User = require('../src/model/User').user;
const neo = require('../src/config/neo4j.db');
const assert = require('assert');

chai.should();
chai.use(chaiHttp);

describe('Friendship', () => {

    beforeEach((done) => {
        User.create([{
            username: 'bart',
            password: 'aron'
        },
        {
            username: 'aron',
            password: 'bart'
        },
        {
            username: 'atal',
            password: 'test'
        }]).then(() => {
            const session = neo.session();
            session.run(
                'MERGE (u1:USER {username: $user1}) ' +
                'MERGE (u2:USER {username: $user2}) ' +
                'MERGE (:USER {username: $user3}) ' +
                'MERGE (u1)-[:FRIENDS_WITH]-(u2) ',
                {
                    user1: "bart",
                    user2: "aron",
                    user3: "atal"
                })
                .then(result => {
                    session.close();
                    done();
                })
                .catch((error) => {
                    session.close();
                });
        });
    });

    it('creates a friendship', (done) => {

        chai.request(server)
            .post('/api/friendship')
            .send({
                "user1": "aron",
                "user2": "atal"
            })
            .end((err, res) => {
                res.should.have.status(200);
                const session = neo.session();

                session.run("MATCH (n:USER {username:$user1})-[:FRIENDS_WITH]-(n2:USER {username:$user2}) RETURN n.username, n2.username",
                    {
                        user1: "aron",
                        user2: "atal"
                    })
                    .then((result) => {
                        assert(result.records.length > 0)
                        assert(result.records[0]._fields[0] === "aron");
                        assert(result.records[0]._fields[1] === "atal");
                        done();
                        session.close();
                    })
                    .catch(() => session.close())

            });
    }).timeout(4000);

    it('doesn\'t create a friendship with a none existing user', (done) => {

        chai.request(server)
            .post('/api/friendship')
            .send({
                "user1": "fred",
                "user2": "atal"
            })
            .end((err, res) => {
                res.should.have.status(404);
                const session = neo.session();

                session.run("MATCH (n:USER {username:$user1})-[:FRIENDS_WITH]-(n2:USER {username:$user2}) RETURN n.username, n2.username",
                    {
                        user1: "aron",
                        user2: "atal"
                    })
                    .then((result) => {
                        assert(result.records.length === 0)
                        done();
                        session.close();
                    })
                    .catch(() => session.close())

            });
    }).timeout(4000);

    it('doesn\'t create a friendship when no user is provided', (done) => {

        chai.request(server)
            .post('/api/friendship')
            .send({
                "user1": "aron"
            })
            .end((err, res) => {
                res.should.have.status(412);
                const session = neo.session();

                session.run("MATCH (n:USER {username:$user1})-[:FRIENDS_WITH]-(n2:USER {username:$user2}) RETURN n.username, n2.username",
                    {
                        user1: "aron",
                        user2: "atal"
                    })
                    .then((result) => {
                        assert(result.records.length === 0)
                        done();
                        session.close();
                    })
                    .catch(() => session.close())

            });
    }).timeout(4000);

    it('deletes a friendship', (done) => {

        chai.request(server)
            .delete('/api/friendship')
            .send({
                "user1": "bart",
                "user2": "aron"
            })
            .end((err, res) => {
                res.should.have.status(200);
                const session = neo.session();

                session.run("MATCH (n:USER {username:$user1})-[:FRIENDS_WITH]-(n2:USER {username:$user2}) RETURN n.username, n2.username",
                    {
                        user1: "bart",
                        user2: "aron"
                    })
                    .then((result) => {
                        assert(result.records.length === 0)
                        done();
                        session.close();
                    })
                    .catch(() => session.close())

            });
    }).timeout(4000);

    it('doesn\'t delete a friendship when a user doesn\'t exist', (done) => {

        chai.request(server)
            .delete('/api/friendship')
            .send({
                "user1": "fred",
                "user2": "aron"
            })
            .end((err, res) => {
                res.should.have.status(404);
                const session = neo.session();

                session.run("MATCH (n:USER {username:$user1})-[:FRIENDS_WITH]-(n2:USER {username:$user2}) RETURN n.username, n2.username",
                    {
                        user1: "bart",
                        user2: "aron"
                    })
                    .then((result) => {
                        assert(result.records.length === 1)
                        assert(result.records[0]._fields[0] === "bart");
                        assert(result.records[0]._fields[1] === "aron");
                        done();
                        session.close();
                    })
                    .catch(() => session.close())

            });
    }).timeout(4000);
    it('doesn\'t delete a friendship when a user is not provied', (done) => {

        chai.request(server)
            .delete('/api/friendship')
            .send({
                "user2": "aron"
            })
            .end((err, res) => {
                res.should.have.status(412);
                const session = neo.session();

                session.run("MATCH (n:USER {username:$user1})-[:FRIENDS_WITH]-(n2:USER {username:$user2}) RETURN n.username, n2.username",
                    {
                        user1: "bart",
                        user2: "aron"
                    })
                    .then((result) => {
                        assert(result.records.length === 1)
                        assert(result.records[0]._fields[0] === "bart");
                        assert(result.records[0]._fields[1] === "aron");
                        done();
                        session.close();
                    })
                    .catch(() => session.close())

            });
    }).timeout(4000);
});