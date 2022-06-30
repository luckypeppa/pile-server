require("dotenv").config();

const app = require("./app");
const mongoose = require("mongoose");

const dbUrl = process.env.DATABASE_URL;
mongoose
  .connect(dbUrl)
  .then(() => {
    app.listen(process.env.PORT);
    console.log("Connected to database.");
  })
  .catch((err) => console.log(err));
