const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thread: {
        type: Schema.Types.ObjectId,
        ref: 'thread'
    },
    upvotes: [{
        type: String
    }],
    downvotes: [{
        type: String
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comment'
    }]
},{
    toJSON: { getters: true }
});

CommentSchema.virtual('upvoteCount').get(function() {
    return this.upvotes.length;
});
CommentSchema.virtual('downvoteCount').get(function() {
    return this.downvotes.length;
});
CommentSchema.virtual('voteScore').get(function() {
    return (this.upvotes.length - this.downvotes.length);
});

let autoPopulate = function(next) {
    this.populate('comments');
    next();
};

CommentSchema
    .pre('findOne', autoPopulate)
    .pre('find', autoPopulate);

const Comment = mongoose.model('comment', CommentSchema);
module.exports = {schema: CommentSchema, model: Comment};
