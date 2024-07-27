const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const userOld = await User.findOne({email});
    if(userOld){
        return res.status(400).json({msg: "Email already exists"});
    }
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send("User created");
  } catch (error) {
    res.status(400).send("Error creating user\nMessage => " + error.message);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyMjEwMzg2MSwiaWF0IjoxNzIyMTAzODYxfQ.EeaLiDoVxdA8qJfYPkRN7Z0XsGEWREvenuAe2nbvAhM");
      res.json({ token });
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (error) {
    return res.status(400).json("Something went wrong while login the user\nMessage => " + error.message)
  }
});

module.exports = router;