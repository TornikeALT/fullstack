import { useEffect, useState } from 'react';
import axios from 'axios';
import Reply from './Reply';

import reply from '../icons/icon-reply.svg';
import plus from '../icons/icon-plus.svg';
import minus from '../icons/icon-minus.svg';
import deleteIcon from '../icons/icon-delete.svg';
import DeleteModal from './DeleteModa';

function Comment() {
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editReplyId, setEditReplyId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editReplyContent, setEditReplyContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      const response = await axios.get('http://localhost:4000/comments');
      const result = await response.data;
      const { currentUser, comments } = result[0];
      setData(comments);
      setCurrentUser(currentUser);
    };
    fetchComments();
  }, []);

  const handleReplyClick = commentId => {
    setReplyTo(replyTo === commentId ? null : commentId);
  };

  // add comment
  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') return;
    try {
      const response = await axios.post('http://localhost:4000/comments', {
        content: newComment,
        user: {
          image: { png: currentUser.image.png },
          username: currentUser.username,
        },
        createdAt: new Date().toUTCString().slice(5, 16),
        score: 0,
        replies: [],
      });

      const newCommentData = response.data;
      setData([newCommentData, ...data]); // Update state to include the new comment
      setNewComment(''); // Clear the input field
    } catch (error) {
      console.log(error);
    }
  };

  // add reply
  const handleReplySubmit = async commentId => {
    if (newReply.trim() === '') return;

    try {
      const response = await axios.post(
        `http://localhost:4000/comments/${commentId}/replies`,
        {
          content: newReply,
          user: {
            image: { png: currentUser.image.png },
            username: currentUser.username,
          },
        }
      );
      const updatedComments = data.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, replies: [...comment.replies, response.data] };
        }
        return comment;
      });
      setData(updatedComments);
      setNewReply('');
      setReplyTo(null);
    } catch (error) {
      console.error(error);
    }
  };

  //delete comment

  const handleCommentDelete = async id => {
    setIsModalOpen(true);
    try {
      await axios.delete('http://localhost:4000/comments/' + id);
      setData(data.filter(comment => comment.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  //delete reply
  const handleDeleteReply = async (replyId, commentId) => {
    try {
      await axios.delete(
        `http://localhost:4000/comments/${commentId}/replies/${replyId}`
      );
      const updatedComments = data.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== replyId),
          };
        }
        return comment;
      });
      setData(updatedComments);
    } catch (error) {
      console.error(error);
    }
  };

  // Edit Comment
  const handleEditComment = async commentId => {
    if (!editCommentContent.trim()) return;

    try {
      await axios.put(`http://localhost:4000/comments/${commentId}`, {
        content: editCommentContent,
      });

      const updatedComments = data.map(comment =>
        comment.id === commentId
          ? { ...comment, content: editCommentContent }
          : comment
      );

      setData(updatedComments);
      setEditCommentId(null);
      setEditCommentContent('');
    } catch (error) {
      console.error(error);
    }
  };

  // Edit Reply
  const handleEditReply = async (replyId, parentCommentId) => {
    if (!editReplyContent.trim()) return;

    try {
      await axios.put(
        `http://localhost:4000/comments/${parentCommentId}/replies/${replyId}`,
        {
          content: editReplyContent,
        }
      );

      const updatedComments = data.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === replyId
                ? { ...reply, content: editReplyContent }
                : reply
            ),
          };
        }
        return comment;
      });

      setData(updatedComments);
      setEditReplyId(null);
      setEditReplyContent('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpvote = async commentId => {
    try {
      await axios.post(`http://localhost:4000/comments/${commentId}/upvote`);

      const updatedComments = data.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, score: comment.score + 1 };
        }
        return comment;
      });

      setData(updatedComments);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownvote = async commentId => {
    try {
      await axios.post(`http://localhost:4000/comments/${commentId}/downvote`);

      const updatedComments = data.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, score: comment.score - 1 };
        }
        return comment;
      });

      setData(updatedComments);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = commentId => {
    setIsModalOpen(true);
    setDeleteTarget(commentId);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/comments/${deleteTarget}`);
      const updatedComments = data.filter(
        comment => comment.id !== deleteTarget
      );
      setData(updatedComments);
    } catch (error) {
      console.error(error);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="container">
      {data.map(comment => {
        return (
          <div key={comment.id} className="comment_wrapper">
            <div className="comment">
              <div className="score">
                <img
                  src={plus}
                  alt="plus"
                  onClick={() => handleUpvote(comment.id)}
                />
                <span>{comment.score}</span>
                <img
                  src={minus}
                  alt="minus"
                  onClick={() => handleDownvote(comment.id)}
                />
              </div>
              <div style={{ flex: '2' }}>
                <div className="user_credentials_wrapper">
                  <div className="user_credentials">
                    <img
                      src={comment.user.image.png}
                      alt={comment.user.username}
                    />
                    <h3>{comment.user.username}</h3>
                    {currentUser?.username === comment.user.username ? (
                      <span className="you">you</span>
                    ) : (
                      ''
                    )}
                    <span className="create_time">{comment.createdAt}</span>
                  </div>
                  <div className="reply_btn">
                    {currentUser?.username === comment.user.username ? (
                      <div className="delete_actions">
                        <img
                          src={deleteIcon}
                          alt="delete"
                          onClick={() => handleDeleteClick(comment.id)}
                        />
                        <span
                          onClick={() => handleDeleteClick(comment.id)}
                          className="delete_btn"
                        >
                          Delete
                        </span>
                      </div>
                    ) : null}
                    <div className="reply_actions">
                      <img
                        src={reply}
                        alt="reply"
                        onClick={() => handleReplyClick(comment.id)}
                      />
                      <span
                        onClick={() => handleReplyClick(comment.id)}
                        className="reply_clr"
                      >
                        Reply
                      </span>
                    </div>
                  </div>
                </div>
                <p>{comment.content}</p>
              </div>
            </div>
            <div className="replies">
              {comment.replies &&
                comment.replies.map(reply => (
                  <Reply
                    key={reply.id}
                    reply={reply}
                    currentUser={currentUser}
                    data={data}
                    setData={setData}
                    parentComment={comment.id}
                    handleDeleteReply={handleDeleteReply}
                    handleReplySubmit={handleReplySubmit}
                    handleEditReply={handleEditReply}
                    handleEditComment={handleEditComment}
                  />
                ))}
            </div>
            {replyTo === comment.id && (
              <div className="reply_input">
                <img src={currentUser.image.png} alt={currentUser.username} />
                <textarea
                  type="text"
                  placeholder="Add a reply..."
                  value={newReply}
                  onChange={e => setNewReply(e.target.value)}
                />
                <button onClick={() => handleReplySubmit(comment.id)}>
                  REPLY
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div className="reply_input">
        <img src={currentUser?.image.png} alt={currentUser?.username} />
        <textarea
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button onClick={handleCommentSubmit}>SEND</button>
      </div>
      <DeleteModal
        isModalOpen={isModalOpen}
        onConfirm={confirmDelete}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default Comment;
