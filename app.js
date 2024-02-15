require("dotenv").config();

const express = require("express");
const cors = require("cors");
const methodOverride = require("method-override");
const expressLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
// const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
// const dbString = process.env.MONGO_DB_URI;
// const connection = mongoose.createConnection(process.env.MONGO_DB_URI);
const helmet = require("helmet");

const MongoClient = require("mongodb").MongoClient;
const clientPromise = MongoClient.connect(process.env.MONGO_DB_URI);

const app = express();
const PORT = 3000 || process.env.PORT;

// Connect to Databse
const connectDB = require("./server/config/db.js");
const { isActiveRoute } = require("./server/helpers/routeHelpers.js");

// const sessionStore = MongoStore.create({
//   client: connection.getClient(),
//   collection: "session",
// });

connectDB();

app.use(
  session({
    store: MongoStore.create({ clientPromise }),
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(methodOverride("_method"));

app.use(express.static("public"));

// Templating Engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.locals.isActiveRoute = isActiveRoute;

app.use("/", require("./server/routes/main.js"));
app.use("/", require("./server/routes/admin.js"));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

// Security

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);
