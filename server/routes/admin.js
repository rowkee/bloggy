const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const adminLayout = "../views/layouts/admin";

// Checked if logged in
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorised login" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    // basically, below once this middleware has the userId from the decoded JWT, it add it to the req
    // and passes the request along.
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorised login" });
  }
};

// This GETS the  admin LOGIN PAGE
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description:
        "The ramblings of content you can find funnier Dilbert cartoons for.",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

//This POSTS the REGISTERATION info for sign up

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User Created", user });
      res.redirect("/admin");
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already exists" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error) {
    console.log(error);
  }
});

//This POSTS the to SIGN IN

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(402).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(402).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

// This GETS the admin dashboard

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const data = await Post.find();
    const locals = {
      title: "Dasbhoard",
      description:
        "The ramblings of content you can find funnier Dilbert cartoons for.",
    };
    res.render("admin/dashboard", { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// CREATE A NEW POST

router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const data = await Post.find();
    const locals = {
      title: "Add Post",
      description:
        "The ramblings of content you can find funnier Dilbert cartoons for.",
    };
    res.render("admin/add-post", { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
