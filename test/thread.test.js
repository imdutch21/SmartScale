const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const User = require('../src/model/User').user;
const Thread = require('../src/model/Thread');
const Comment = require('../src/model/Comment').model;
const neo = require('../src/config/neo4j.db');

chai.should();
chai.use(chaiHttp);

describe('Thread', () => {

    let thread1, thread2, thread3, comment1, comment2;

    beforeEach(function(done) {
        this.timeout(10000);
        const aron = new User({ username: 'aron', password: '1234'});
        const bart = new User({ username: 'bart', password: '1234'});
        const atal = new User({ username: 'atal', password: '1234'});
        const rick = new User({ username: 'rick', password: '1234'});

        Promise.all([aron.save(), bart.save(), atal.save(), rick.save()])
            .then(() => {
                thread1 = new Thread({
                    author: 'aron',
                    title: 'A title',
                    content: 'Some content'
                });
                comment1 = new Comment({
                    author: 'aron',
                    thread: thread1._id,
                    content: 'Some content'
                });
                comment2 = new Comment({
                    author: 'aron',
                    thread: thread1._id,
                    content: 'Some content'
                });
                thread1.comments.push(comment1);
                comment1.comments.push(comment2);
                thread1.downvotes.push('rick');
                thread2 = new Thread({
                    author: 'atal',
                    title: 'Another title',
                    content: 'Some other content'
                });
                thread2.upvotes.push('rick');
                thread3 = new Thread({
                    author: 'bart',
                    title: 'A third title',
                    content: 'Some third content'
                });
                return Promise.all([thread1.save(), thread2.save(), thread3.save(), comment1.save(), comment2.save()])})
            .then(() => done())
    });

    it('creates a thread successfully',(done) => {
        chai.request(server)
            .post('/api/thread')
            .send({
                username: 'aron',
                title: 'A title',
                content: 'Some content'
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('_id');
                body.should.have.property('author').equals('aron');
                body.should.have.property('title').equals('A title');
                body.should.have.property('content').equals('Some content');
                done();
            });
    }).timeout(4000);

    it('doesn\'t create a thread when a non-existing user is provided',(done) => {
        chai.request(server)
            .post('/api/thread')
            .send({
                username: 'john doe',
                title: 'A title',
                content: 'Some content'
            })
            .end((error, response) => {
                response.should.have.status(404);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('doesn\'t create a thread when a title is missing',(done) => {
        chai.request(server)
            .post('/api/thread')
            .send({
                username: 'aron',
                content: 'Some content'
            })
            .end((error, response) => {
                response.should.have.status(412);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('updates a thread\'s content successfully',(done) => {
        chai.request(server)
            .put('/api/thread?type=content')
            .send({
                username: 'aron',
                password: '1234',
                threadId: thread1._id,
                title: 'A title',
                content: 'Some new content'
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;

                body.should.have.property('content').equals('Some new content');
                done();
            });
    }).timeout(4000);

    it('doesn\'t updates a thread\'s content if username doesn\'t exist',(done) => {
        chai.request(server)
            .put('/api/thread?type=content')
            .send({
                username: 'johndoe',
                password: '1234',
                threadId: thread1._id,
                title: 'A title',
                content: 'Some new content'
            })
            .end((error, response) => {
                response.should.have.status(404);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('doesn\'t updates a thread\'s content if username doesn\'t match author',(done) => {
        chai.request(server)
            .put('/api/thread?type=content')
            .send({
                username: 'bart',
                password: '1234',
                threadId: thread1._id,
                title: 'A title',
                content: 'Some new content'
            })
            .end((error, response) => {
                response.should.have.status(404);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('doesn\'t updates a thread\'s content if password doesn\'t match',(done) => {
        chai.request(server)
            .put('/api/thread?type=content')
            .send({
                username: 'aron',
                password: '123456',
                threadId: thread1._id,
                title: 'A title',
                content: 'Some new content'
            })
            .end((error, response) => {
                response.should.have.status(404);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('upvote a thread successfully',(done) => {
        chai.request(server)
            .put('/api/thread?type=upvote')
            .send({
                username: 'aron',
                threadId: thread1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('upvotes').that.contains('aron');
                body.should.have.property('downvotes').that.contains('rick');
                done();
            });
    }).timeout(4000);

    it('upvote a thread successfully when the previous vote was a downvote',(done) => {
        chai.request(server)
            .put('/api/thread?type=upvote')
            .send({
                username: 'rick',
                threadId: thread1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('upvotes').that.contains('rick');
                body.should.have.property('downvotes').length(0);
                done();
            });
    }).timeout(4000);

    it('doesn\'t upvote a thread when username does not exist',(done) => {
        chai.request(server)
            .put('/api/thread?type=upvote')
            .send({
                username: 'johndoe',
                threadId: thread1._id
            })
            .end((error, response) => {
                response.should.have.status(404);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('downvote a thread successfully',(done) => {
        chai.request(server)
            .put('/api/thread?type=downvote')
            .send({
                username: 'aron',
                threadId: thread1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('upvotes').length(0);
                body.should.have.property('downvotes').that.contains('aron');
                done();
            });
    }).timeout(4000);

    it('downvote a thread successfully when the previous vote was a upvote',(done) => {
        chai.request(server)
            .put('/api/thread?type=downvote')
            .send({
                username: 'rick',
                threadId: thread1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('downvotes').that.contains('rick');
                body.should.have.property('upvotes').length(0);
                done();
            });
    }).timeout(4000);

    it('gets all threads in unsorted order when provided the unsorted type',(done) => {
        chai.request(server)
            .get('/api/thread?type=unsorted')
            .send({})
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');
                done();
            });
    }).timeout(4000);

    it('doesn\'t get any threads when no type is specified',(done) => {
        chai.request(server)
            .get('/api/thread')
            .send({})
            .end((error, response) => {
                response.should.have.status(412);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('gets all threads in sorted order on upvotes when provided the sort type',(done) => {
        chai.request(server)
            .get('/api/thread?type=sort_on_upvotes')
            .send({})
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body[0].title.should.equals(thread2.title);
                done();
            });
    }).timeout(4000);

    it('gets all threads in sorted order on score when provided the sort type',(done) => {
        chai.request(server)
            .get('/api/thread?type=sort_on_score')
            .send({})
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body[0].title.should.equals(thread2.title);
                body[1].title.should.equals(thread3.title);
                body[2].title.should.equals(thread1.title);
                done();
            });
    }).timeout(4000);

    it('gets all threads in sorted order on comments when provided the sort type',(done) => {
        chai.request(server)
            .get('/api/thread?type=sort_on_comments')
            .send({})
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body[0].title.should.equals(thread1.title);
                done();
            });
    }).timeout(4000);

    it('gets a single thread when provided the single type',(done) => {
        chai.request(server)
            .get('/api/thread?type=single&id=' + thread1._id)
            .send({})
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body[0].should.have.property('comments').length(1);
                body[0].comments[0].should.have.property('comments').length(1);
                body[0].should.have.property('totalComments').length(2);
                done();
            });
    }).timeout(4000);

    it('doesn\'t get a single thread when id is missing',(done) => {
        chai.request(server)
            .get('/api/thread?type=single')
            .send({})
            .end((error, response) => {
                response.should.have.status(500);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('deletes a thread successfully',(done) => {
        chai.request(server)
            .delete('/api/thread')
            .send({
                threadId: thread1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('_id');
                done();
            });
    }).timeout(4000);

    it('doesn\'t delete a thread when threadId is missing',(done) => {
        chai.request(server)
            .delete('/api/thread')
            .send({})
            .end((error, response) => {
                response.should.have.status(412);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);
    it('doesn\'t return any related threads when friendship length is 1 and all threads are further than 1',(done) => {
        let session = neo.session();
        session.run(
            'MERGE (:USER { username: $username })',
            { username: 'aron' })
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MERGE (:USER { username: $username })',
                    { username: 'aron' })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MERGE (:USER { username: $username })',
                    { username: 'rick' })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MATCH (u1:USER { username: $user1}), (u2:USER { username: $user2}) ' +
                    'MERGE (u1)-[:FRIENDS_WITH]-(u2)',
                    {
                        user1: 'aron',
                        user2: 'rick'
                    })})
            .then(() => {
                session.close();
                chai.request(server)
                    .get('/api/thread?type=related&username=aron&friendshipLength=1')
                    .send({})
                    .end((error, response) => {
                        response.should.have.status(200);
                        response.should.be.a('object');

                        const body = response.body;
                        body.should.have.length(0);
                        done();
                    });
            });
    }).timeout(20000);

    it('returns 1 related thread when friendship length is 2 and 1 thread is further than 2',(done) => {
        let session = neo.session();
        session.run(
            'MERGE (:USER { username: $username })',
            { username: 'aron' })
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MERGE (:USER { username: $username })',
                    { username: 'aron' })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MERGE (:USER { username: $username })',
                    { username: 'rick' })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MERGE (:USER { username: $username })',
                    { username: 'atal' })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MATCH (u1:USER { username: $user1}), (u2:USER { username: $user2}) ' +
                    'MERGE (u1)-[:FRIENDS_WITH]-(u2)',
                    {
                        user1: 'aron',
                        user2: 'rick'
                    })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MATCH (u1:USER { username: $user1}), (u2:USER { username: $user2}) ' +
                    'MERGE (u1)-[:FRIENDS_WITH]-(u2)',
                    {
                        user1: 'rick',
                        user2: 'atal'
                    })})
            .then(() => {
                session.close();
                chai.request(server)
                    .get('/api/thread?type=related&username=aron&friendshipLength=2')
                    .send({})
                    .end((error, response) => {
                        response.should.have.status(200);
                        response.should.be.a('object');

                        const body = response.body;
                        body.should.have.length(1);
                        body[0].title.should.equals(thread2.title);
                        done();
                    });
            });
    }).timeout(20000);

    it('returns 2 related thread when friendship length is 3 and no other threads are further',(done) => {
        let session = neo.session();
        session.run(
            'MERGE (:USER { username: $username })',
            { username: 'aron' })
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MERGE (:USER { username: $username })',
                    { username: 'aron' })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MERGE (:USER { username: $username })',
                    { username: 'rick' })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MERGE (:USER { username: $username })',
                    { username: 'atal' })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MERGE (:USER { username: $username })',
                    { username: 'bart' })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MATCH (u1:USER { username: $user1}), (u2:USER { username: $user2}) ' +
                    'MERGE (u1)-[:FRIENDS_WITH]-(u2)',
                    {
                        user1: 'aron',
                        user2: 'rick'
                    })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MATCH (u1:USER { username: $user1}), (u2:USER { username: $user2}) ' +
                    'MERGE (u1)-[:FRIENDS_WITH]-(u2)',
                    {
                        user1: 'rick',
                        user2: 'atal'
                    })})
            .then(() => {
                session.close();
                session = neo.session();
                return session.run(
                    'MATCH (u1:USER { username: $user1}), (u2:USER { username: $user2}) ' +
                    'MERGE (u1)-[:FRIENDS_WITH]-(u2)',
                    {
                        user1: 'atal',
                        user2: 'bart'
                    })})
            .then(() => {
                session.close();
                chai.request(server)
                    .get('/api/thread?type=related&username=aron&friendshipLength=3')
                    .send({})
                    .end((error, response) => {
                        response.should.have.status(200);
                        response.should.be.a('object');

                        const body = response.body;
                        body.should.have.length(2);
                        done();
                    });
            });
    }).timeout(20000);
});
