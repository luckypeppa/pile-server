const express = require("express");

const router = express.Router();

const {
  createComment,
  getAllCommentsByBlogId,
  deleteComment,
  updateComment,
} = require("../controller/comment");

const { authenticateToken } = require("./authUtils");

router.post("/:commentId", updateComment);
router.post("/", authenticateToken, createComment);
router.get("/:blogId", getAllCommentsByBlogId);
router.delete("/:commentId", deleteComment);

module.exports = router;
