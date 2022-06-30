const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const blogRouter = require("./routes/blog");
const authRouter = require("./routes/auth");
const commentRouter = require("./routes/comment");
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(fileUpload());
app.use("/blogs", blogRouter);
app.use("/auth", authRouter);
app.use("/comments", commentRouter);

module.exports = app
