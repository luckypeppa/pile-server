const Blog = require("../model/blog");
const Tag = require("../model/tag");
const fs = require("fs");

const createBlog = async (req, res) => {
  const { title, snippet, body, coverUrl, tags } = req.body;

  //create a new blog
  const blog = new Blog({
    title,
    snippet,
    body,
    coverUrl,
  });

  for (const t of tags) {
    try {
      //check if the tag exists
      const result = await Tag.findOne({ name: t }).exec();
      let tag;
      if (result) {
        tag = result;
      } else {
        tag = new Tag({ name: t });
      }

      // set blog's tags
      blog.tags.push(tag);

      // set tag's blogs
      tag.blogs.push(blog);
      await tag.save();
    } catch (err) {
      return res.status(500).send({ message: "can not save tag." });
    }
  }

  // save blog
  try {
    await blog.save();
  } catch (err) {
    return res.status(500).send({ message: "can not save blog." });
  }

  res.sendStatus(201);
};

const getAllBlogs = (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .populate("tags", "name")
    .then((result) => res.send(result))
    .catch(() => res.status(500).send({ message: "server side error" }));
};

const saveImage = (req, res) => {
  if (req.files) {
    const ext = req.files.file.name.split(".")[1];
    const allowedExtensions = ["jpg", "png", "jpeg"];
    if (!allowedExtensions.includes(ext.toLowerCase())) {
      return res.status(400).send({ message: "Extension not allowed." });
    }
    const randomName = Math.random().toString().slice(2, 14);
    if (!fs.existsSync("./public/images")) {
      try {
        fs.mkdirSync("./public/images");
      } catch (err) {
        console.log(err);
      }
    }
    const imageUrl = `images/${randomName}.${ext}`;
    req.files.file.mv("./public/" + imageUrl, (err) => {
      if (err) return res.status(500).send({ message: "can not save image." });
      res.send({ imageUrl });
    });
  }
};

const getBlog = (req, res) => {
  Blog.findById(req.params.id)
    .populate("tags", "name")
    .then((result) => {
      if (!result) return res.status(404).send({ message: "not found" });
      res.send({ blog: result });
    });
};

const updateBlog = async (req, res) => {
  const id = req.params.id;
  const { title, snippet, body, coverUrl, tags } = req.body;

  //create a new blog
  let blog;
  try {
    blog = await Blog.findByIdAndUpdate(
      { _id: id },
      {
        title,
        snippet,
        body,
        coverUrl,
      },
      {
        new: true,
        overwrite: true,
      }
    ).exec();
    if (!blog) return res.status(404).send({ message: "Not Found" });
  } catch (err) {
    return res.status(500).send({ message: "Server Side Error" });
  }

  for (const t of tags) {
    try {
      //check if the tag exists
      const result = await Tag.findOne({ name: t });
      let tag;
      if (result) {
        tag = result;
      } else {
        tag = new Tag({ name: t });
      }

      // set blog's tags
      blog.tags.push(tag);

      // set tag's blogs
      tag.blogs.push(blog);
      await tag.save();
    } catch (err) {
      return res.status(500).send({ message: "Can not save tag." });
    }
  }

  // save blog
  try {
    await blog.save();
  } catch (err) {
    return res.status(500).send({ message: "Can not save blog" });
  }

  res.sendStatus(201);
};

const deleteBlog = (req, res) => {
  const id = req.params.id;

  Blog.deleteOne({ _id: id })
    .then(() => res.sendStatus(201))
    .catch(() => res.status(404).send({ message: "Not found." }));
};

const getBlogsByTag = (req, res) => {
  const tag = req.params.tag;

  Tag.findOne({ name: tag }).exec((err, tag) => {
    if (err) return res.status(500).send({ message: "Server Side Error" });
    if (!tag) return res.send([]);
    Blog.find({ tags: tag._id })
      .populate("tags", "name")
      .exec((err, blogs) => {
        if (err) return res.status(500).send({ message: "Server Side Error" });
        return res.send(blogs);
      });
  });
};

const getAllTags = (req, res) => {
  Tag.find().exec((err, tags) => {
    if (err) return res.status(500).send({ message: "Server Side Error" });
    res.send({ tags });
  });
};

const searchBlogs = (req, res) => {
  const input = req.params.input;

  Blog.where("title")
    .regex(new RegExp(input))
    .populate("tags", "name")
    .exec((err, blogs) => {
      if (err) return res.status(500).send({ message: "Server Side Error" });
      res.send(blogs);
    });
};

module.exports = {
  getAllBlogs,
  createBlog,
  saveImage,
  getBlog,
  updateBlog,
  deleteBlog,
  getBlogsByTag,
  getAllTags,
  searchBlogs,
};
