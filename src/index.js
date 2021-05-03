const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");

const session_secret = "blogPost";

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.use(
  session({
    secret: session_secret,
    cookie: { maxAge: 1 * 60 * 60 * 1000 },
  })
);

const db = mongoose.createConnection("mongodb://localhost:27017/blogpost", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const adminSchema = new mongoose.Schema({
  userName: String,
  password: String,
});
const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
});
const postsSchema = new mongoose.Schema({
  title: String,
  author: String,
  content: String,
  userId: mongoose.Schema.Types.ObjectId,
  adminId: mongoose.Schema.Types.ObjectId,
});

const adminModel = db.model("admin", adminSchema);
const userModel = db.model("user", userSchema);
const postModel = db.model("post", postsSchema);

const isNullOrUndefined = (val) => val === null || val === undefined;
const SALT = 5;

app.post("/signup", async (req, res) => {
  const { userName, password } = req.body;
  const existingUser = await userModel.findOne({ userName });
  if (isNullOrUndefined(existingUser)) {
    // we should allow signup
    const hashedPwd = bcrypt.hashSync(password, SALT);
    const newUser = new userModel({ userName, password: hashedPwd });

    await newUser.save();
    req.session.userId = newUser._id;
    // const infoToAdmin = new adminModel({ userInfo })
    // req.session.userIdToAdmin = newUser._id;
    res.status(201).send({ success: "Signed up" });
  } else {
    res.status(400).send({
      err: `UserName ${userName} already exists. Please choose another.`,
    });
  }
});
app.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  const existingUser = await userModel.findOne({
    userName,
  });

  if (isNullOrUndefined(existingUser)) {
    res.status(401).send({ err: "UserName does not exist." });
  } else {
    const hashedPwd = existingUser.password;
    if (bcrypt.compareSync(password, hashedPwd)) {
      req.session.userId = existingUser._id;
      console.log("Session saved with", req.session);
      res.status(200).send({ success: "Logged in" });
    } else {
      res.status(401).send({ err: "Password is incorrect." });
    }
  }
}); 
               // HERE IS THE CODE FOR LOGOUT //

// app.post("/logout", (req, res)=> {
//   if(!isNullOrUndefined(req.session)) {
//       req.session.destroy(() => {
//           res.sendStatus(200);
//       });

//   } else {
//       res.sendStatus(200);
//   }
// });

const AuthMiddleware = async (req, res, next) => {
  console.log("Session", req.session);
  // added user key to req
  if (isNullOrUndefined(req.session) || isNullOrUndefined(req.session.userId)) {
    res.status(401).send({ err: "Not logged in" });
  } else {
    next();
  }
};

app.post("/posts", AuthMiddleware, async (req, res) => {
  const post = req.body;
  post.userId = req.session.userId;
  post.adminId = req.session.adminId;
  const newPost = new postModel(post);
  await newPost.save();
  req.session.postId = newPost._id;
  res.status(201).send(newPost);
});
app.put("/posts", AuthMiddleware, async (req, res) => {
  const { title, author, content } = req.body;

  try {
    const post = await postModel.findOne({
      _id: req.session.postId,
      userId: req.session.userId,
    });
    // console.log("_id is", _id , " >>>>>>>>>" , "userid", userId)
    if (isNullOrUndefined(post)) {
      res.sendStatus(404);
    } else {
      post.title = title;
      post.author = author;
      post.content = content;
      await post.save();
      res.send(post);
    }
  } catch (e) {
    res.sendStatus(404);
  }
});

app.delete("/posts", AuthMiddleware, async (req, res) => {
  try {
    await postModel.deleteOne({
      _id: req.session.postId,
      userId: req.session.userId,
    });
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(404);
  }
});

app.get("/posts", AuthMiddleware, async (req, res) => {
  const posts = await postModel.find({ userId: req.session.userId });
  res.status(200).send(
    posts.map((data) => {
      return { title: data.title, author: data.author };
    })
  );
});
app.get("/posts/:postId", AuthMiddleware, async (req, res) => {
  const postId = req.params.postId;
  const posts = await postModel.find({ userId: req.session.userId });

  if (isNaN(postId)) {
    console.log("reached here");
    res.status(200).send(
      posts.filter((data) => {
        if (data.title === postId) {
          return data;
        }
      })
    );
  } else {
    if (postId >= posts.length) {
      res.send(404);
    } else {
      res.status(200).send(posts[postId]);
    }
  }
});

app.post("/adminSignUp", async (req, res) => {
  const { userName, password } = req.body;
  const existingAdmin = await adminModel.findOne({ userName });
  if (isNullOrUndefined(existingAdmin)) {
    const hashedPwd = bcrypt.hashSync(password, SALT);
    const newAdmin = new adminModel({ userName, password: hashedPwd });

    await newAdmin.save();
    req.session.adminId = newAdmin._id;
    res.status(201).send({ success: "admin Signed up" });
  } else {
    res.status(400).send({
      err: `admin ${userName} already exists. Please choose another.`,
    });
  }
});

app.post("/adminLogin", async (req, res) => {
  const { userName, password } = req.body;
  const existingAdmin = await adminModel.findOne({ userName });
  if (isNullOrUndefined(existingAdmin)) {
    res.status(404).send("admin details doesn't exist");
  } else {
    const hashedPwd = existingAdmin.password;
    if (bcrypt.compareSync(password, hashedPwd)) {
      req.session.adminId = existingAdmin._id;
      console.log("Session saved with", req.session);
      res.status(200).send({ success: "Admin Logged in" });
    } else {
      res.status(401).send({ err: "Password is incorrect." });
    }
  }

  app.delete("/deleteByAdmin", AuthMiddleware, async (req, res) => {
    try {
      await postModel.deleteOne({ adminId: req.session.adminId });
      res.sendStatus(200);
    } catch (e) {
      res.Status(404).send("no user is in active to delete");
    }
  });
});

app.listen(8080);
