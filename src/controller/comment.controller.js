const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const User = require('../model/User').user;
const Thread = require('../model/Thread');
const Comment = require('../model/Comment').model;
const ApiError = require('../model/ApiError');
const assert = require('assert');

addComment = function(request, response, next) {
    try {
        const types = ['comment','thread'];

        assert(typeof(request.body) === 'object', 'Request body must be of type object');
        assert(request.query.target, 'No type specified');
        assert(typeof(request.query.target) === 'string', 'Type must be of type string');
        assert(types.includes(request.query.target.toLowerCase().trim()), 'No valid type specified');

        assert(request.body.threadId, 'ThreadId is missing from body');
        assert(request.body.username, 'Username is missing from body');
        assert(request.body.content, 'Content is missing from body');
        assert(typeof(request.body.threadId) === 'string', 'ThreadId property must be of type string');
        assert(typeof(request.body.username) === 'string', 'Username property must be of type string');
        assert(typeof(request.body.content) === 'string', 'Content property must be of type string');

        switch(request.query.target.toLowerCase().trim()) {
            case 'comment':
                addCommentOption(request, response, next);
                break;

            case 'thread':
                addThreadOption(request, response, next);
                break;
        }
    } catch(error) {
        next(new ApiError(error.message, 412));
    }
};

addCommentOption = function(request, response, next) {
    try {
        assert(request.body.commentId, 'CommentId is missing from body');
        assert(typeof(request.body.commentId) === 'string', 'CommentId property must be of type string');

        User.findOne({ username: request.body.username })
            .then((user) => {
                if (user !== null) {
                    Thread.findById({
                        _id: new ObjectId(request.body.threadId)
                    })
                        .then((thread) => {
                            if(thread !== null) {
                                Comment.findById({
                                    _id: new ObjectId(request.body.commentId)
                                })
                                    .then((comment) => {
                                        if(comment !== null) {
                                            const newComment = new Comment({
                                                author: request.body.username,
                                                content: request.body.content,
                                                thread: request.body.threadId
                                            });
                                            comment.comments.push(newComment);

                                            Promise.all([newComment.save(), comment.save()])
                                                .then(response.status(200).json(newComment).end())
                                                .catch((error) => next(new ApiError(error.toString(), 500)));
                                        } else {
                                            next(new ApiError('CommentId doesn\'t match any Comment in the database', 404));
                                        }
                                    })
                                    .catch((error) => next(new ApiError(error.toString(), 500)));
                            } else {
                                next(new ApiError('ThreadId doesn\'t match any ThreadId in the database', 404));
                            }
                        })
                        .catch((error) => next(new ApiError(error.toString(), 500)));
                } else {
                    next(new ApiError('Username doesn\'t match any user in the database', 404));
                }
            }).catch((error) => next(new ApiError(error.toString(), 500)));
    } catch(error) {
        next(new ApiError(error.message, 412));
    }
};

addThreadOption = function(request, response, next) {
    User.findOne({ username: request.body.username })
        .then((user) => {
            if (user !== null) {
                Thread.findById(
                    {
                        _id: new ObjectId(request.body.threadId)
                    })
                    .then((thread) => {
                        if(thread !== null) {
                            const newComment = new Comment({
                                author: request.body.username,
                                content: request.body.content,
                                thread: request.body.threadId
                            });
                            thread.comments.push(newComment);
                            Promise.all([newComment.save(), thread.save()])
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
        }).catch((error) => next(new ApiError(error.toString(), 500)));
};

updateComment = function(request, response, next) {
    try {
        const types = ['upvote','downvote'];

        assert(request.query.type, 'No type specified');
        assert(typeof(request.query.type) === 'string', 'Type must be of type string');
        assert(types.includes(request.query.type.toLowerCase().trim()), 'No valid type specified');

        assert(typeof(request.body) === 'object', 'Request body must be of type object');
        assert(request.body.commentId, 'CommentId is missing from body');
        assert(request.body.username, 'Username is missing from body');
        assert(typeof(request.body.commentId) === 'string', 'CommentId property must be of type string');
        assert(typeof(request.body.username) === 'string', 'Username property must be of type string');

        switch(request.query.type.toLowerCase().trim()) {
            case 'upvote':
                updateCommentUpvote(request, response, next);
                break;

            case 'downvote':
                updateCommentDownvote(request, response, next);
                break;
        }
    } catch(error) {
        next(new ApiError(error.message, 412));
    }
};

updateCommentUpvote = function(request, response, next) {
    User.findOne({ username: request.body.username })
        .then((user) => {
            if(user !== null) {
                Comment.findOneAndUpdate(
                    {
                        _id: new ObjectId(request.body.commentId)
                    },
                    {
                        $pull: { upvotes: request.body.username, downvotes: request.body.username }
                    },
                    {
                        new: true
                    })
                    .then((comment) => {
                        if(comment !== null) {
                            comment.upvotes.push(request.body.username);
                            comment.save()
                                .then(response.status(200).json(comment).end())
                                .catch((error) => next(new ApiError(error.toString(), 500)));
                        } else {
                            next(new ApiError('CommentId doesn\'t match any CommentId in the database', 404));
                        }
                    })
                    .catch((error) => next(new ApiError(error.toString(), 500)));
            } else {
                next(new ApiError('Username doesn\'t match any user in the database', 404));
            }
        })
        .catch((error) => next(new ApiError(error.toString(), 500)));
};

updateCommentDownvote = function(request, response, next) {
    User.findOne({ username: request.body.username })
        .then((user) => {
            if(user !== null) {
                Comment.findOneAndUpdate(
                    {
                        _id: new ObjectId(request.body.commentId)
                    },
                    {
                        $pull: { upvotes: request.body.username, downvotes: request.body.username }
                    },
                    {
                        new: true
                    })
                    .then((comment) => {
                        if(comment !== null) {
                            comment.downvotes.push(request.body.username);
                            comment.save()
                                .then(response.status(200).json(comment).end())
                                .catch((error) => next(new ApiError(error.toString(), 500)));
                        } else {
                            next(new ApiError('CommentId doesn\'t match any CommentId in the database', 404));
                        }
                    })
                    .catch((error) => next(new ApiError(error.toString(), 500)));
            } else {
                next(new ApiError('Username doesn\'t match any user in the database', 404));
            }
        })
        .catch((error) => next(new ApiError(error.toString(), 500)));
};

deleteComment = function(request, response, next) {
    try {
        assert(typeof(request.body) === 'object', 'Request body must be of type object');
        assert(request.body.commentId, 'CommentId is missing from body');
        assert(typeof(request.body.commentId) === 'string', 'CommentId property must be of type string');

        Comment.findOneAndUpdate(
            {
                _id: new ObjectId(request.body.commentId)
            },
            {
                author: '[deleted]',
                content: '[deleted]'
            },
            {
                new: true
            })
            .then((comment) => response.status(200).json(comment).end())
            .catch((error) => next(new ApiError(error.toString(), 500)));
    } catch(error) {
        next(new ApiError(error.message, 412));
    }
};

module.exports = { addComment, updateComment, deleteComment };
