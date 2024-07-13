const express = require('express')

const router = express.Router()
const data = require('../data')

const getComments = () => data[0].comments;
const getCurrentUser = () => data[0].currentUser;

//GET ALL COMMENTS
router.get('/comments', (req, res) => {
    res.json(data)
})

//POST NEW COMMENTS

router.post('/comments', (req, res) => {
    const comments = getComments()
    const newComment = {
        id: comments.length + 1,
        content: req.body.content,
        createdAt: new Date().toUTCString().slice(5, 16),
        score: 0,
        user: req.body.user,
        replies: []
    }
    comments.push(newComment)
    res.status(201).json(newComment)
})

// Add a reply to comment

router.post('/comments/:commentId/replies', (req, res) => {
    const comments = getComments();
    const commentId = parseInt(req.params.commentId, 10);
    const parentComment = comments.find(comment => comment.id === commentId);
    if (parentComment) {
        const newReply = {
            id: parentComment.replies.length + 1,
            content: req.body.content,
            createdAt: new Date().toUTCString().slice(5, 16),
            score: 0,
            replyingTo: parentComment.user.username,
            user: req.body.user
        };
        parentComment.replies.push(newReply);
        res.status(201).json(newReply);
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
});

// Update Comment
router.put('/comments/:commentId', (req, res) => {
    const comments = getComments();
    const commentId = parseInt(req.params.commentId);
    const comment = comments.find(comment => comment.id === commentId);
    if (comment) {
        comment.content = req.body.content;
        res.json(comment);
    } else {
        res.status(404).json({ message: 'Comment update not found' });
    }
});

// Update a reply
router.put('/comments/:commentId/replies/:replyId', (req, res) => {
    const comments = getComments()
    const commentId = parseInt(req.params.commentId);
    const replyId = parseInt(req.params.replyId);
    const parentComment = comments.find(comment => comment.id === commentId);
    if (parentComment) {
        const reply = parentComment.replies.find(reply => reply.id === replyId);
        if (reply) {
            reply.content = req.body.content;
            res.json(reply);
        } else {
            res.status(404).json({ message: 'Reply not found' });
        }
    } else {
        res.status(404).json({ message: 'Comment reply not found' });
    }
});

// Delete a comment
router.delete('/comments/:commentId', (req, res) => {
    const comments = getComments();
    const commentId = parseInt(req.params.commentId);
    const index = comments.findIndex(comment => comment.id === commentId);
    if (index !== -1) {
        comments.splice(index, 1);
        res.status(204).end();
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
});

// Delete a reply
router.delete('/comments/:commentId/replies/:replyId', (req, res) => {
    const comments = getComments();
    const commentId = parseInt(req.params.commentId);
    const replyId = parseInt(req.params.replyId);
    const parentComment = comments.find(comment => comment.id === commentId);
    if (parentComment) {
        parentComment.replies = parentComment.replies.filter(reply => reply.id !== replyId);
        res.status(204).end();
    } else {
        res.status(404).json({ message: 'delete reply not found' });
    }
});

// Add a comment to a reply
router.post('/comments/:commentId/replies/:replyId/comments', (req, res) => {
    const comments = getComments();
    const commentId = parseInt(req.params.commentId);
    const replyId = parseInt(req.params.replyId);
    const parentComment = comments.find(comment => comment.id === commentId);

    if (parentComment) {
        const reply = parentComment.replies.find(reply => reply.id === replyId);
        if (reply) {
            const newCommentToReply = {
                id: reply.comments ? reply.comments.length + 1 : 1,
                content: req.body.content,
                createdAt: new Date().toUTCString().slice(5, 16),
                score: 0,
                user: req.body.user
            };

            // Initialize replies array if it doesn't exist
            if (!reply.comments) {
                reply.comments = [];
            }
            reply.comments.push(newCommentToReply);
            res.status(201).json(newCommentToReply);
        } else {
            res.status(404).json({ message: 'Reply not found' });
        }
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
});


// Upvote comment
router.post('/comments/:commentId/upvote', (req, res) => {
    const comments = getComments();
    const commentId = parseInt(req.params.commentId, 10);
    const comment = comments.find(comment => comment.id === commentId);
    if (comment) {
        comment.score += 1;
        res.status(200).json(comment);
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
});

// Downvote comment
router.post('/comments/:commentId/downvote', (req, res) => {
    const comments = getComments();
    const commentId = parseInt(req.params.commentId, 10);
    const comment = comments.find(comment => comment.id === commentId);
    if (comment) {
        comment.score -= 1;
        res.status(200).json(comment);
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
});

// Upvote a reply
router.post('/comments/:commentId/replies/:replyId/upvote', (req, res) => {
    const comments = getComments();
    const commentId = parseInt(req.params.commentId, 10);
    const replyId = parseInt(req.params.replyId, 10);
    const parentComment = comments.find(comment => comment.id === commentId);
    if (parentComment) {
        const reply = parentComment.replies.find(reply => reply.id === replyId);
        if (reply) {
            reply.score += 1;
            res.status(200).json(reply);
        } else {
            res.status(404).json({ message: 'Reply not found' });
        }
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
});

// Downvote a reply
router.post('/comments/:commentId/replies/:replyId/downvote', (req, res) => {
    const comments = getComments();
    const commentId = parseInt(req.params.commentId, 10);
    const replyId = parseInt(req.params.replyId, 10);
    const parentComment = comments.find(comment => comment.id === commentId);
    if (parentComment) {
        const reply = parentComment.replies.find(reply => reply.id === replyId);
        if (reply) {
            reply.score -= 1;
            res.status(200).json(reply);
        } else {
            res.status(404).json({ message: 'Reply not found' });
        }
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
});



module.exports = router;