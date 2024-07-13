import { useState } from 'react';
import axios from 'axios';

import replyIcon from '../icons/icon-reply.svg';
import editIcon from '../icons/icon-edit.svg';
import deleteIcon from '../icons/icon-delete.svg';
import plus from '../icons/icon-plus.svg';
import minus from '../icons/icon-minus.svg';
import DeleteModal from './DeleteModa';

function Reply({
  reply,
  currentUser,
  data,
  setData,
  parentComment,
  handleDeleteReply,
}) {
  const [replyTo, setReplyTo] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [editReplyContent, setEditReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    replyId: null,
    parentCommentId: null,
  });

  const handleReplyClick = () => {
    setReplyTo(replyTo ? null : reply.id);
  };

  const handleReplySubmit = async () => {
    if (newReply.trim() === '') return;

    try {
      const response = await axios.post(
        `http://localhost:4000/comments/${parentComment}/replies/${reply.id}/comments`,
        {
          content: newReply,
          user: {
            image: { png: currentUser.image.png },
            username: currentUser.username,
          },
        }
      );

      const updatedComments = data.map(comment => {
        if (comment.id === parentComment) {
          return {
            ...comment,
            replies: comment.replies
              ? [...comment.replies, response.data]
              : [response.data],
          };
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

  const handleEditClick = () => {
    setEditReplyContent(reply.content);
    setIsEditing(true);
  };

  const handleEditSubmit = async () => {
    if (!editReplyContent.trim()) return;

    try {
      await axios.put(
        `http://localhost:4000/comments/${parentComment}/replies/${reply.id}`,
        {
          content: editReplyContent,
        }
      );

      const updatedComments = data.map(comment => {
        if (comment.id === parentComment) {
          return {
            ...comment,
            replies: comment.replies.map(r =>
              r.id === reply.id ? { ...r, content: editReplyContent } : r
            ),
          };
        }
        return comment;
      });

      setData(updatedComments);
      setIsEditing(false);
      setEditReplyContent('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyUpvote = async (commentId, replyId) => {
    try {
      const response = await axios.post(
        `http://localhost:4000/comments/${commentId}/replies/${replyId}/upvote`
      );
      const updatedReply = response.data;
      setData(prevData =>
        prevData.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === updatedReply.id ? updatedReply : reply
                ),
              }
            : comment
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyDownvote = async (commentId, replyId) => {
    try {
      const response = await axios.post(
        `http://localhost:4000/comments/${commentId}/replies/${replyId}/downvote`
      );
      const updatedReply = response.data;
      setData(prevData =>
        prevData.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply.id === updatedReply.id ? updatedReply : reply
                ),
              }
            : comment
        )
      );
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteClick = (replyId, parentCommentId) => {
    setShowModal(true);
    setDeleteTarget({ replyId, parentCommentId });
  };

  const confirmDelete = () => {
    handleDeleteReply(deleteTarget.replyId, deleteTarget.parentCommentId);
    setShowModal(false);
  };

  return (
    <>
      <div className="reply">
        <div className="score">
          <img
            src={plus}
            alt="plus"
            onClick={() => handleReplyUpvote(parentComment, reply.id)}
          />
          <span>{reply.score}</span>
          <img
            src={minus}
            alt="minus"
            onClick={() => handleReplyDownvote(parentComment, reply.id)}
          />
        </div>
        <div style={{ flex: '2' }}>
          <div className="user_credentials_wrapper">
            <div className="user_credentials">
              <img src={reply.user.image.png} alt={reply.user.username} />
              <h3>{reply.user.username}</h3>
              <span className="create_time">{reply.createdAt}</span>
            </div>
            <div className="reply_action">
              {currentUser?.username === reply.user.username ? (
                <div className="delete_edit">
                  <div className="delete">
                    <img
                      src={deleteIcon}
                      alt="delete"
                      onClick={() => handleDeleteClick(reply.id, parentComment)}
                    />
                    <span
                      onClick={() => handleDeleteClick(reply.id, parentComment)}
                      className="delete_btn"
                    >
                      Delete
                    </span>
                  </div>
                  <div className="edit">
                    <span onClick={handleEditClick}>Edit</span>
                    <img src={editIcon} alt="edit" onClick={handleEditClick} />
                  </div>
                </div>
              ) : (
                <div className="reply_btn">
                  <img src={replyIcon} alt="reply" onClick={handleReplyClick} />
                  <span onClick={handleReplyClick} className="reply_clr">
                    Reply
                  </span>
                </div>
              )}
            </div>
          </div>
          {isEditing ? (
            <div>
              <textarea
                value={editReplyContent}
                onChange={e => setEditReplyContent(e.target.value)}
                placeholder="Edit your reply..."
              />
              <button onClick={handleEditSubmit}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <p>
              <span className="replying_to">@{reply.replyingTo} </span>
              {reply.content}
            </p>
          )}
        </div>
      </div>
      {replyTo === reply.id && (
        <div className="reply_input">
          <img src={currentUser.image.png} alt={currentUser.username} />
          <textarea
            type="text"
            placeholder="Add a reply..."
            value={newReply}
            onChange={e => setNewReply(e.target.value)}
          />
          <button onClick={handleReplySubmit}>Reply</button>
        </div>
      )}
      <DeleteModal
        isModalOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default Reply;
