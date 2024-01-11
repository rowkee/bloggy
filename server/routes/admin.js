const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const adminLayout = "../views/layouts/admin";

// DIY middleware that checks if anyone is logged in, can be reused for each route
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

// This GETS the  admin LOGIN PAGE to display it
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

//This POSTS the REGISTERATION info for signing up admin users (hidden in frontend)

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

//This POSTS the data to SIGN IN an admin user

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

// This GETS the admin dashboard to display it

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const data = await Post.find();
    const updatedData = data.map((post) => {
      return {
        ...post.toObject(),
        _id: post._id.toString(),
      };
    });
    const locals = {
      title: "Dashboard",
      description:
        "The ramblings of content you can find funnier Dilbert cartoons for.",
    };
    res.render("admin/dashboard", {
      locals,
      updatedData,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

// This GETS the new post form to display it

router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const data = await Post.find();
    const updatedData = data.map((post) => {
      return {
        ...post.toObject(), // Convert Mongoose document to a plain JavaScript object
        _id: post._id.toString(), // Convert _id to string
      };
    });
    const locals = {
      title: "Add Post",
      description:
        "The ramblings of content you can find funnier Dilbert cartoons for.",
    };
    res.render("admin/add-post", { locals, updatedData, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// This POSTS the content of a new blog post

router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });
      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

// This will GET the data for the post that is to be edited

router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description:
        "The ramblings of content you can find funnier Dilbert cartoons for.",
    };
    const data = await Post.findOne({ _id: req.params.id });
    // console.log(data);
    res.render("admin/edit-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

// This PUTS data when submitting edits to post
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    console.log(req.params.id);
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});

// This DELETES a post

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});
