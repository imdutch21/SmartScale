const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThreadSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
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

ThreadSchema.virtual('upvoteCount').get(function() {
    return this.upvotes.length;
});
ThreadSchema.virtual('downvoteCount').get(function() {
    return this.downvotes.length;
});
ThreadSchema.virtual('voteScore').get(function() {
    return (this.upvotes.length - this.downvotes.length);
});

let autoPopulate = function(next) {
    this.populate('comments');
    next();
};

ThreadSchema
    .pre('findOne', autoPopulate)
    .pre('find', autoPopulate)
    .pre('findOneAndDelete', function(next) {
        const Comment = mongoose.model('comment');
        Comment.deleteMany({
            thread: this._conditions._id
        }).then(() => next());
    });

const Thread = mongoose.model('thread', ThreadSchema);
module.exports = Thread;
