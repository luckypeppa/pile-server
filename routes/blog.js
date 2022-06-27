const express = require("express");
const {
  getAllBlogs,
  createBlog,
  saveImage,
  getBlog,
  updateBlog,
  deleteBlog,
  getBlogsByTag,
  getAllTags,
  searchBlogs,
} = require("../controller/blog");

const { authenticateToken, authenticateRole } = require("./authUtils");

const router = express.Router();

router.post("/image", authenticateToken, authenticateRole, saveImage);
router.get("/tag/:tag", getBlogsByTag);
router.get("/tag/", getAllTags);
router.get("/search/:input", searchBlogs);
router.get("/:id", getBlog);
router.post("/:id", authenticateToken, authenticateRole, updateBlog);
router.delete("/:id", authenticateToken, authenticateRole, deleteBlog);
router.get("/", getAllBlogs);
router.post("/", authenticateToken, authenticateRole, createBlog);

module.exports = router;
