require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../model/user");
const RefreshToken = require("../model/refreshToken");
const Role = require("../model/role");

const router = express.Router();

// register user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  // check empty
  if (!username || !email || !password)
    return res
      .status(400)
      .send({ message: "Username, email, password can not be empty." });

  // check password's length
  if (password.length < 12)
    return res.status(400).json({
      message: "Password at least has a length of 12.",
    });

  const existedUser = await User.findOne({ username: username });
  // if username already existed return
  if (existedUser)
    return res.status(400).send({ message: "The username has been used." });

  try {
    // get default user role
    const userRole = await Role.findOne({ name: "user" });
    if (!userRole)
      return res.status(500).json({ message: "User role doesn't exist." });

    // generate hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      hashedPassword,
      role: userRole._id,
    });
    await newUser.save();
    user.populate("role", "name");
    const user = newUser.toObject();

    // generate access token and refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
    });

    //   return newRefreshToken.save();
    await newRefreshToken.save();

    // send back tokens
    res.status(201).json({
      ...user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log("err:", err);
    res.status(500).send({ message: err.message });
  }
});

// user login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .send({ message: "Username and password can not be empty." });

  // find existed user
  const existedUser = await User.findOne({ username: username }).populate(
    "role",
    "name"
  );
  if (!existedUser)
    return res.status(404).json({ message: "Incorrect username." });

  try {
    // compare passwords
    const result = await bcrypt.compare(password, existedUser.hashedPassword);
    if (!result)
      return res.status(403).json({ message: "Incorrect password." });

    existedUser.populate("role", "name");
    const user = existedUser.toObject();

    // generate access token and refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
    });

    //   return newRefreshToken.save();
    await newRefreshToken.save();

    // send back tokens
    res.json({
      ...user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log("err:", err);
    res.status(500).send({ message: err.message });
  }
});

// user logout
router.delete("/login", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  await RefreshToken.deleteOne({ token: refreshToken });
  res.sendStatus(200);
});

// regenerate access token
router.post("/token", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) return res.sendStatus(401);

  RefreshToken.findOne({ token: refreshToken })
    .then((token) => {
      if (!token) return res.sendStatus(401);
      if (Date.now() - new Date(token.createdAt) > 604800000) {
        return res.sendStatus(401);
      }
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          console.log("err:", err);
          const user = { payload: payload.username, email: payload.email };
          if (err) return res.sendStatus(403);
          const accessToken = generateAccessToken(user);
          res.json({ accessToken });
        }
      );
    })
    .catch((err) => {
      console.log("err:", err);
      return res.sendStatus(500);
    });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = router;
