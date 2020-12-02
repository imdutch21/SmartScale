const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const User = require('../src/model/User').user;
const assert = require('assert');

chai.should();
chai.use(chaiHttp);

describe('User', () => {
    let joe;

    it('creates a user', (done) => {
        joe = {
            "username": 'joe',
            "password": 'banaan'
        }
        chai.request(server)
            .post('/api/user')
            .send(joe)
            .end((err, res) => {
                res.should.have.status(200);
                User.findOne({ username: 'joe' })
                    .then((user) => {
                        assert(user);
                        done();
                    })
            });
    }).timeout(4000);

    it('doesn\'t create a user when wrong data is provided', (done) => {
        joe = {
            "username": 'joe'
        }
        chai.request(server)
            .post('/api/user')
            .send(joe)
            .end((err, res) => {
                res.should.have.status(412);

                User.findOne({ username: 'joe' })
                    .then((user) => {
                        assert(!user);
                        done();
                    })
            });
    }).timeout(4000);

    it('doesn\'t create a user when username already exists', (done) => {
        joe = {
            "username": 'joe',
            "password": 'banaan'
        }
        User.create(new User({
            "username": 'joe',
            "password": 'banaan'
        })).then(() => {
            chai.request(server)
                .post('/api/user')
                .send(joe)
                .end((err, res) => {
                    res.should.have.status(500);

                    done();
                });
        });
    }).timeout(4000);

    it('updates a user\'s password', (done) => {
        joe = {
            "username": 'joe',
            "old_password": 'banaan',
            "new_password": 'nieuwe_banaan'
        }
        User.create({
            "username": 'joe',
            "password": 'banaan'
        }).then(() => {

            chai.request(server)
                .put('/api/user')
                .send(joe)
                .end((err, res) => {
                    res.should.have.status(200);
                    User.findOne({ username: 'joe' })
                        .then((user) => {
                            assert(user.password === joe.new_password);
                            done();
                        })
                });
        });
    }).timeout(4000);

    it('doesn\'t update a user\'s password when a wrong password is provided', (done) => {
        joe = {
            "username": 'joe',
            "old_password": '...',
            "new_password": 'nieuwe_banaan'
        }
        User.create({
            "username": 'joe',
            "password": 'banaan'
        }).then(() => {
            chai.request(server)
                .put('/api/user')
                .send(joe)
                .end((err, res) => {
                    res.should.have.status(401);
                    User.findOne({ username: 'joe' })
                        .then((user) => {
                            assert(user.password !== joe.new_password);
                            done();
                        })
                });
        })
    }).timeout(4000);
    it('doesn\'t update a user when no new password provided', (done) => {
        joe = {
            "username": 'joe',
            "old_password": 'banaan'
        }
        User.create({
            "username": 'joe',
            "password": 'banaan'
        }).then(() => {

            chai.request(server)
                .put('/api/user')
                .send(joe)
                .end((err, res) => {
                    res.should.have.status(412);
                    User.findOne({ username: 'joe' })
                        .then((user) => {
                            assert(user.password !== joe.new_password);
                            done();
                        })
                });
        });
    }).timeout(4000);


    it('sets a user to inactive when deleted', (done) => {
        joe = {
            "username": 'joe',
            "password": 'banaan'
        }
        User.create(joe).then(() => {
            chai.request(server)
                .delete('/api/user')
                .send(joe)
                .end((err, res) => {
                    res.should.have.status(200);
                    User.findOne({ username: 'joe' })
                        .then((user) => {
                            assert(!user.isActive);
                            done();
                        })
                });
        });
    }).timeout(4000);

    it('doesn\'t set a user to inactive when invallid password is given', (done) => {
        joe = {
            "username": 'joe',
            "password": 'banaan',
            "isActive": true
        }
        User.create({
            "username": 'joe',
            "password": 'adwde',
            "isActive": true
        }).then(() => {
            chai.request(server)
                .delete('/api/user')
                .send(joe)
                .end((err, res) => {
                    res.should.have.status(401);
                    User.findOne({ username: 'joe' })
                        .then((user) => {
                            assert(user.isActive);
                            done();
                        })
                });
        });
    }).timeout(4000);

    it('doesn\'t set a user to inactive when no username was found', (done) => {
        joe = {
            "username": 'joe',
            "password": 'adwde',
            "isActive": true
        }
        User.create({
            "username": 'freddy',
            "password": 'adwde',
            "isActive": true
        }).then(() => {
            chai.request(server)
                .delete('/api/user')
                .send(joe)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    }).timeout(4000);

    it('sets a user to inactive when deleted', (done) => {
        joe = {
            "username": 'joe',
            "password": 'banaan',
            "isActive": true
        }
        User.create(joe).then(() => {
            chai.request(server)
                .delete('/api/user')
                .send(joe)
                .end((err, res) => {
                    res.should.have.status(200);
                    User.findOne({ username: 'joe' })
                        .then((user) => {
                            assert(!user.isActive);
                            done();
                        })
                });
        });
    }).timeout(4000);
});