const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const User = require('../model/User').user;
const Thread = require('../model/Thread');
const Comment = require('../model/Comment').model;
const neo = require('../config/neo4j.db');
const ApiError = require('../model/ApiError');
const assert = require('assert');

createThread = function(request, response, next) {
    try {
        console.log(request.body)
        assert(typeof(request.body) === 'object', 'Request body must be of type object');
        assert(request.body.username, 'Username is missing from body');
        assert(request.body.title, 'Title is missing from body');
        assert(request.body.content, 'Content is missing from body');
        assert(typeof(request.body.username) === 'string', 'Username property must be of type string');
        assert(typeof(request.body.title) === 'string', 'Title property must be of type string');
        assert(typeof(request.body.content) === 'string', 'Content property must be of type string');
        
        User.findOne({ username: request.body.username })
            .then((user) => {
                if(user !== null) {
                    const thread = new Thread({
                        author: request.body.username,
                        title: request.body.title,
                        content: request.body.content
                    });
                    thread.save()
                        .then(() => {
                            response.status(200).json(thread).end();
                        })
                        .catch((error) => next(new ApiError(error.toString(), 500)));
                } else {
                    next(new ApiError('Username doesn\'t match any user in the database', 404));
                }
            })
            .catch((error) => next(new ApiError(error.toString(), 500)));
    } catch(error) {
        next(new ApiError(error.message, 412));
    }
};

updateThread = function(request, response, next) {
    try {
        const types = ['content','upvote','downvote'];

        assert(request.query.type, 'No type specified');
        assert(request.body.threadId, 'ThreadId is missing from body');
        assert(request.body.username, 'Username is missing from body');
        assert(typeof(request.body.username) === 'string', 'Username property must be of type string');

        assert(typeof(request.query.type), 'Type must be of type string');
        assert(typeof(request.body.threadId) === 'string', 'ThreadId property must be of type string');

        assert(types.includes(request.query.type.toLowerCase().trim()), 'No valid type specified');

        switch(request.query.type.toLowerCase().trim()) {
            case 'content':
                updateContent(request, response, next);
                break;

            case 'upvote':
                updateUpvote(request, response, next);
                break;

            case 'downvote':
                updateDownvote(request, response, next);
                break;
        }
    } catch(error) {
        next(new ApiError(error.message, 412));
    }
};

deleteThread = function(request, response, next) {
    try {
        assert(typeof(request.body) === 'object', 'Request body must be of type object');
        assert(request.body.threadId, 'ThreadId is missing from body');
        assert(typeof(request.body.threadId) === 'string', 'ThreadId property must be of type string');

        Thread.findOneAndDelete(
            {
                _id: new ObjectId(request.body.threadId)
            })
            .then((thread) => response.status(200).json(thread).end())
            .catch((error) => next(new ApiError(error.toString(), 500)));
    } catch(error) {
        next(new ApiError(error.message, 412));
    }
};

getThread = function(request, response, next) {
    try {
        const types = ['unsorted','sort_on_upvotes','sort_on_score','sort_on_comments','single','related'];

        assert(request.query.type, 'No type specified');
        assert(typeof(request.query.type) === 'string', 'Type must be of type string');
        assert(types.includes(request.query.type.toLowerCase().trim()), 'No valid type specified');

        switch(request.query.type.toLowerCase().trim()) {
            case 'unsorted':
                getUnsorted(request, response, next);
                break;

            case 'sort_on_upvotes':
                getSortedOnUpvotes(request, response, next);
                break;

            case 'sort_on_score':
                getSortedOnScore(request, response, next);
                break;

            case 'sort_on_comments':
                getSortedOnComments(request, response, next);
                break;

            case 'single':
                getSingle(request, response, next);
                break;

            case 'related':
                getRelatedThreads(request, response, next);
                break;

            default:
                next(new ApiError('An error occurred', 500));
                break;
            // case 'test':
            //     Comment.aggregate()
            //         .project({
            //             '_id': 1,
            //             'author': 1,
            //             'thread': 1,
            //             'content': 1
            //         })
            //         .then((threads) => response.status(200).json(threads).end())
            //         .catch((error) => next(new ApiError(error.toString(), 500)));
            //     break;
        }
    } catch(error) {
        next(new ApiError(error.message, 412));
    }
};

updateContent = function(request, response, next) {
    try {
        assert(request.body.content, 'Content is missing from body');
        assert(request.body.password, 'Password is missing from body');
        assert(typeof(request.body.content) === 'string', 'Content property must be of type string');
        assert(typeof(request.body.password) === 'string', 'Password property must be of type string');

        User.findOne({ username: request.body.username, password: request.body.password})
            .then((user) => {
                if(user !== null) {
                    Thread.findOne({ _id: request.body.threadId, author: request.body.username })
                        .then((thread) => {
                            if(thread !== null) {
                                thread.set('content', request.body.content);
                                thread.save()
                                    .then(() => response.status(200).json(thread).end())
                                    .catch((error) => next(new ApiError(error.toString(), 500)));
                            } else {
                                next(new ApiError('Thread does not exist or provided username doesn\'t match username of thread', 404));
                            }

                        })
                        .catch((error) => next(new ApiError(error.toString(), 500)));
                } else {
                    next(new ApiError('Username and/or password are incorrect', 404));
                }
            })
            .catch((error) => next(new ApiError(error.toString(), 500)));
    } catch(error) {
        next(new ApiError(error.message, 412));
    }
};

updateUpvote = function(request, response, next) {
    User.findOne({ username: request.body.username })
        .then((user) => {
            if(user !== null) {
                Thread.findOneAndUpdate(
                    {
                        _id: new ObjectId(request.body.threadId)
                    },
                    {
                        $pull: { upvotes: request.body.username, downvotes: request.body.username }
                    },
                    {
                        new: true
                    })
                    .then((thread) => {
                        if(thread !== null) {
                            thread.upvotes.push(request.body.username);
                            thread.save()
                                .then((thread) => response.status(200).json(thread).end())
                                .catch((error) => next(new ApiError(error.toString(), 500)));
                        } else {
                            next(new ApiError('ThreadId doesn\'t match any Thread in the database', 404));
                        }
                    })
                    .catch((error) => next(new ApiError(error.toString(), 500)));
            } else {
                next(new ApiError('Username doesn\'t match any user in the database', 404));
            }
        })
        .catch((error) => next(new ApiError(error.toString(), 500)));
};

updateDownvote = function(request, response, next) {
    User.findOne({ username: request.body.username })
        .then((user) => {
            if(user !== null) {
                Thread.findOneAndUpdate(
                    {
                        _id: new ObjectId(request.body.threadId)
                    },
                    {
                        $pull: { upvotes: request.body.username, downvotes: request.body.username }
                    },
                    {
                        new: true
                    })
                    .then((thread) => {
                        if(thread !== null) {
                            thread.downvotes.push(request.body.username);
                            thread.save()
                                .then(response.status(200).json(thread).end())
                                .catch((error) => next(new ApiError(error.toString(), 500)));
                        } else {
                            next(new ApiError('ThreadId doesn\'t match any Thread in the database', 404));
                        }
                    })
                    .catch((error) => next(new ApiError(error.toString(), 500)));
            } else {
                next(new ApiError('Username doesn\'t match any user in the database', 404));
            }
        })
        .catch((error) => next(new ApiError(error.toString(), 500)));
};

getUnsorted = function(request, response, next) {
    Thread.aggregate()
        .project({
            '_id': 1,
            'author': 1,
            'title': 1,
            'content': 1,
            'upvotes': { '$size': '$upvotes' },
            'downvotes': { '$size': '$downvotes' }
        })
        .then((threads) => response.status(200).json(threads).end())
        .catch((error) => next(new ApiError(error.toString(), 500)));
};

getSortedOnUpvotes = function(request, response, next) {
    Thread.aggregate()
        .project({
            '_id': 1,
            'author': 1,
            'title': 1,
            'content': 1,
            'upvotes': { '$size': '$upvotes' },
            'downvotes': { '$size': '$downvotes' }
        })
        .sort({ 'upvotes': -1})
        .then((threads) => response.status(200).json(threads).end())
        .catch((error) => next(new ApiError(error.toString(), 500)));
};

getSortedOnScore = function(request, response, next) {
    Thread.aggregate()
        .project({
            '_id': 1,
            'author': 1,
            'title': 1,
            'content': 1,
            'upvotes': { '$size': '$upvotes' },
            'downvotes': { '$size': '$downvotes' },
            'score': { '$subtract': [{ '$size': '$upvotes' },{ '$size': '$downvotes' }]}
        })
        .sort({ 'score': -1})
        .then((threads) => response.status(200).json(threads).end())
        .catch((error) => next(new ApiError(error.toString(), 500)));
};

getSortedOnComments = function(request, response, next) {
    Thread.aggregate()
        .lookup({
            from: Comment.collection.name,
            localField: '_id',
            foreignField: 'thread',
            as: 'totalComments'
        })
        .project({
            '_id': 1,
            'author': 1,
            'title': 1,
            'content': 1,
            'upvotes': { '$size': '$upvotes' },
            'downvotes': { '$size': '$downvotes' },
            'comments': { '$size': '$totalComments' }
        })
        .sort({ 'comments': -1})
        .then((threads) => response.status(200).json(threads).end())
        .catch((error) => next(new ApiError(error.toString(), 500)));
};

getSingle = function(request, response, next) {
    try {
        assert(request.query.id, 'ThreadId is missing from body');
        assert(typeof(request.query.id) === 'string', 'ThreadId property must be of type string');

        Thread.aggregate()

            .match({ _id: new ObjectId(request.query.id) })
            .lookup({
                from: Comment.collection.name,
                localField: '_id',
                foreignField: 'thread',
                as: 'totalComments'
            })
            .project({
                '_id': 1,
                'author': 1,
                'title': 1,
                'content': 1,
                'comments': 1,
                'totalComments': 1,
                'upvotes': { '$size': '$upvotes' },
                'downvotes': { '$size': '$downvotes' },
                'votes': { '$subtract': [{ '$size': '$upvotes' },{ '$size': '$downvotes' }]}
            }).exec((function(err, result) {
                Comment.populate(result, { path: 'comments'},function(error, populated) {
                response.status(200).json(populated).end()
            });
        }));
    } catch(error) {
        next(new ApiError(error.message, 500));
    }
};

getRelatedThreads = function(request, response, next) {
    try {
        assert(request.query.username, 'Username is missing from body');
        assert(request.query.friendshipLength,'Length is missing from body');
        assert(typeof(request.query.username) === 'string', 'Username property must be of type string');
        assert(typeof(request.query.friendshipLength) === 'string', 'Username property must be of type string');
    } catch(error) {
        next(new ApiError(error.message, 500));
    }

    const session = neo.session();
    session.run(
        'MATCH(:USER { username: $username })-[:FRIENDS_WITH*1..' + request.query.friendshipLength + ']-(u:USER) RETURN DISTINCT u.username',
        {
            username: request.query.username
        })
        .then((result) => {
            session.close();
            const names = sanitizeNames(result.records);
            Thread.find({ author: { $in: names }})
                .then((threads) => response.status(200).json(threads).end())
                .catch((error) => next(new ApiError(error.toString(), 500)));
        })
        .catch((error) => next(new ApiError(error.toString(), 500)));
};

sanitizeNames = function(records) {
    let list = [];
    records.forEach(function(record) {
        list.push(record._fields[0])
    });
    return list;
};

module.exports = { createThread, updateThread, deleteThread, getThread };
