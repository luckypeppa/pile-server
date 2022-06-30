require("dotenv").config();
const mongoose = require("mongoose");

const dbUrl = process.env.DATABASE_URL;
module.exports = {
  connect() {
    mongoose.connect(dbUrl)
  },
  disconnect(done) {
    mongoose.disconnect(done);
  },
};
