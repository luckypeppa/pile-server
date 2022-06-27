const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) return res.sendStatus(401);
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send("Access Token has expired.");
    req.user = user;
    next();
  });
}

function authenticateRole(req, res, next) {
  const user = req.user;
  console.log(user);
  if (user.role.name === "admin") {
    next();
  } else {
    res.status(403).json({ message: "The action is forbidden." });
  }
}

module.exports = {
  authenticateToken,
  authenticateRole,
};
