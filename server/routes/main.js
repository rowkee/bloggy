const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// Routes
router.get("", async (req, res) => {
  const locals = {
    title: "Mr Bloggy",
    description:
      "The ramblings of content you can find funnier Dilbert cartoons for.",
  };

  try {
    const data = await Post.find();
    res.render("index", { locals, data });
  } catch (error) {
    console.log(error);
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;
    const post = await Post.findById({ _id: slug });
    const locals = {
      title: post.title,
      description:
        "The ramblings of content you can find funnier Dilbert cartoons for.",
    };
    res.render("post", { post, locals });
  } catch (error) {
    console.log(error);
  }
});

router.get("/about", (req, res) => {
  res.render("about");
});

module.exports = router;

//! Used this function to add some dummy data
// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "fake blog post",
//       body: "testing the body text",
//     },
//     {
//       title: "more fakery",
//       body: "testing the body text",
//     },
//     {
//       title: "The Catcher in the Rye",
//       body: "A classic novel by J.D. Salinger, following the story of Holden Caulfield.",
//     },
//     {
//       title: "To Kill a Mockingbird",
//       body: "Harper Lee's masterpiece addressing racial injustice in the American South.",
//     },
//     {
//       title: "1984",
//       body: "George Orwell's dystopian novel depicting a totalitarian society.",
//     },
//     {
//       title: "Pride and Prejudice",
//       body: "Jane Austen's romantic classic exploring societal norms and love.",
//     },
//     {
//       title: "The Great Gatsby",
//       body: "F. Scott Fitzgerald's tale of wealth, love, and the American Dream.",
//     },
//     {
//       title: "The Hobbit",
//       body: "J.R.R. Tolkien's adventurous tale of Bilbo Baggins and his journey.",
//     },
//     {
//       title: "Moby-Dick",
//       body: "Herman Melville's epic novel centered around Captain Ahab's pursuit of a white whale.",
//     },
//     {
//       title: "Frankenstein",
//       body: "Mary Shelley's iconic story of a scientist and his monstrous creation.",
//     },
//     {
//       title: "Harry Potter and the Sorcerer's Stone",
//       body: "J.K. Rowling's fantasy novel introducing the magical world of Harry Potter.",
//     },
//     {
//       title: "The Lord of the Rings",
//       body: "J.R.R. Tolkien's epic fantasy trilogy following the quest to destroy the One Ring.",
//     },
//   ]);
// }
// // insertPostData();
