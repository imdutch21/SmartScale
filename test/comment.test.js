const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');
const User = require('../src/model/User').user;
const Thread = require('../src/model/Thread');
const Comment = require('../src/model/Comment').model;

chai.should();
chai.use(chaiHttp);

describe('Comment', () => {
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
                comment1.upvotes.push('rick');
                comment1.downvotes.push('atal');
                comment2 = new Comment({
                    author: 'aron',
                    thread: thread1._id,
                    content: 'Some content'
                });
                comment2.upvotes.push('rick');
                comment2.downvotes.push('atal');

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

    it('adds a comment to a thread successfully',(done) => {
        chai.request(server)
            .post('/api/comment?target=thread')
            .send({
                threadId: thread2._id,
                username: 'aron',
                content: 'Some content'
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('_id');
                body.should.have.property('comments').length(1);
                body.comments[0].author.should.equals('aron');
                body.comments[0].content.should.equals('Some content');
                done();
            });
    }).timeout(4000);

    it('doesn\'t add a comment to a thread when a non-existing user is provided',(done) => {
        chai.request(server)
            .post('/api/comment?target=thread')
            .send({
                threadId: thread2._id,
                username: 'john doe',
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

    it('adds a comment to another comment successfully',(done) => {
        chai.request(server)
            .post('/api/comment?target=comment')
            .send({
                threadId: thread1._id,
                commentId: comment2._id,
                username: 'rick',
                content: 'Some content'
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('_id');
                body.author.should.equals('rick');
                body.content.should.equals('Some content');
                done();
            });
    }).timeout(4000);

    it('doesn\'t add a comment to another comment when a non-existing user is provided',(done) => {
        chai.request(server)
            .post('/api/comment?target=comment')
            .send({
                threadId: thread1._id,
                commentId: comment2._id,
                username: 'john doe',
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

    it('doesn\'t upvote a thread when username does not exist',(done) => {
        chai.request(server)
            .put('/api/comment?type=upvote')
            .send({
                commentId: comment1._id
            })
            .end((error, response) => {
                response.should.have.status(412);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('upvotes a comment successfully',(done) => {
        chai.request(server)
            .put('/api/comment?type=upvote')
            .send({
                username: 'aron',
                commentId: comment1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('upvotes').length(2);
                body.should.have.property('downvotes').length(1);
                body.should.have.property('upvotes').that.contains('aron');
                body.should.have.property('upvotes').that.contains('rick');
                body.should.have.property('downvotes').that.contains('atal');
                done();
            });
    }).timeout(4000);

    it('upvotes a comment successfully when the previous vote was a downvote',(done) => {
        chai.request(server)
            .put('/api/comment?type=upvote')
            .send({
                username: 'atal',
                commentId: comment1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('upvotes').length(2);
                body.should.have.property('downvotes').length(0);
                body.should.have.property('upvotes').that.contains('atal');
                body.should.have.property('upvotes').that.contains('rick');
                done();
            });
    }).timeout(4000);

    it('doesn\'t upvote a thread when username does not exist',(done) => {
        chai.request(server)
            .put('/api/comment?type=upvote')
            .send({
                username: 'johndoe',
                commentId: comment1._id
            })
            .end((error, response) => {
                response.should.have.status(404);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('downvotes a comment successfully',(done) => {
        chai.request(server)
            .put('/api/comment?type=downvote')
            .send({
                username: 'aron',
                commentId: comment1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('upvotes').length(1);
                body.should.have.property('downvotes').length(2);
                body.should.have.property('upvotes').that.contains('rick');
                body.should.have.property('downvotes').that.contains('aron');
                body.should.have.property('downvotes').that.contains('atal');
                done();
            });
    }).timeout(4000);

    it('downvotes a comment successfully when the previous vote was a upvote',(done) => {
        chai.request(server)
            .put('/api/comment?type=downvote')
            .send({
                username: 'rick',
                commentId: comment1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('upvotes').length(0);
                body.should.have.property('downvotes').length(2);
                body.should.have.property('downvotes').that.contains('atal');
                body.should.have.property('downvotes').that.contains('rick');
                done();
            });
    }).timeout(4000);

    it('doesn\'t downvote a comment when username does not exist',(done) => {
        chai.request(server)
            .put('/api/comment?type=downvote')
            .send({
                username: 'johndoe',
                commentId: comment1._id
            })
            .end((error, response) => {
                response.should.have.status(404);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);

    it('deletes a comment successfully',(done) => {
        chai.request(server)
            .delete('/api/comment')
            .send({
                commentId: comment1._id
            })
            .end((error, response) => {
                response.should.have.status(200);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('_id');
                body.should.have.property('author').equals('[deleted]');
                body.should.have.property('content').equals('[deleted]');
                done();
            });
    }).timeout(4000);

    it('doesn\'t delete a comment when commentId is missing',(done) => {
        chai.request(server)
            .delete('/api/comment')
            .send({})
            .end((error, response) => {
                response.should.have.status(412);
                response.should.be.a('object');

                const body = response.body;
                body.should.have.property('message');
                done();
            });
    }).timeout(4000);
});
