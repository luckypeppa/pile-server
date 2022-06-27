const Blog = require("../model/blog");
const Comment = require("../model/comment");
const User = require("../model/user");

async function createComment(req, res) {
  const { authorId, body, parentId, blogId, replyToId } = req.body;

  try {
    // check if author exists
    const author = await checkExistenceById(authorId, User, "author", res);

    if (parentId) {
      const comment = await checkExistenceById(
        parentId,
        Comment,
        "comment you are replying to",
        res
      );

      const replyToUser = await checkExistenceById(
        replyToId,
        User,
        "user you are replying to",
        res
      );

      // create a new comment
      const newComment = new Comment({
        author: author._id,
        body,
        parent: comment._id,
        replyTo: replyToUser.id || null,
      });
      await newComment.save();

      await newComment.populate("author", "username");
      await newComment.populate("replyTo", "username");

      return res.json(newComment);
    } else {
      // check if blog exists
      const blog = await checkExistenceById(blogId, Blog, "blog", res);

      const newComment = new Comment({
        author: author._id,
        body,
        blog: blog._id,
      });
      await newComment.save();

      await newComment.populate("author", "username");
      await newComment.populate("replyTo", "username");

      return res.json(newComment);
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function getAllCommentsByBlogId(req, res) {
  const blogId = req.params.blogId;

  try {
    const comments = await Comment.find({ blog: blogId }).populate(
      "author",
      "username"
    );

    const commentsObject = [];

    for (const comment of comments) {
      const commentObject = comment.toObject();
      const children = await Comment.find({ parent: comment._id })
        .populate("author", "username")
        .populate("replyTo", "username");

      commentObject.children = children;
      commentsObject.push(commentObject);
    }

    res.json(commentsObject);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function deleteComment(req, res) {
  const commentId = req.params.commentId;

  const result = await Comment.deleteOne({ _id: commentId });

  if (result.deletedCount === 1) {
    return res.sendStatus(200);
  }

  return res
    .status(400)
    .send({ message: "The deleting of the comment failed." });
}

async function updateComment(req, res) {
  const commentId = req.params.commentId;
  const body = req.body.body;

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    await updatedComment.populate("author", "username");
    await updatedComment.populate("replyTo", "username");

    return res.json(updatedComment);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

// check if exists
async function checkExistenceById(id, Model, name, res) {
  const document = await Model.findById(id).exec();
  if (!document)
    return res.status(404).json({ message: `The ${name} doesn't exist.` });
  return document;
}

module.exports = {
  createComment,
  getAllCommentsByBlogId,
  deleteComment,
  updateComment,
};
