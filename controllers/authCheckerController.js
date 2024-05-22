const Checker = require("../model/Checker");
const bcrypt = require("bcrypt");

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) return res.sendStatus(400);
  const foundUser = await Checker.findOne({ username: user }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    res.json({ message: "Login successful", user: foundUser.username });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
