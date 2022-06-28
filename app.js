require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const blogRouter = require("./routes/blog");
const authRouter = require("./routes/auth");
const commentRouter = require("./routes/comment");
const app = express();

const dbUrl = process.env.DATABASE_URL;
mongoose
  .connect(dbUrl)
  .then(() => {
    app.listen(proces.env.PORT);
    console.log("Connected to database.");
  })
  .catch((err) => console.log(err));

app.use(cors());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(fileUpload());
app.use("/blogs", blogRouter);
app.use("/auth", authRouter);
app.use("/comments", commentRouter);
