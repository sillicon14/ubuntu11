import express from "express";
import bcrypt from "bcryptjs";
import data from "../data.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Cart from "../models/cartModel.js";
import { generateToken, isAdmin, isAuth } from "../middleWare/auth.js";

const userRouter = express.Router();

let transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "support@sillicon14.com",
    pass: "Thisisforsupport7474$",
  },
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const verifyUser = await User.findOne({ email: email });
    console.log(email);
    if (!verifyUser) {
      return res.status(401).json({ state: "user doesn't exists" });
    }

    const passCorrect = await bcrypt.compare(password, verifyUser.password);
    if (!passCorrect) {
      return res.status(401).json({ state: "invalid userId or Password" });
    }

    const token = jwt.sign(
      {
        userId: verifyUser._id,
        isAdmin: verifyUser.isAdmin,
      },
      process.env.JWT_SECRET || "somethingsecret"
    );

    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .send({
        _id: verifyUser._id,
        name: verifyUser.name,
        email: verifyUser.email,
        cartId: verifyUser.cartId,
        isAdmin: verifyUser.isAdmin,
      });
  } catch (err) {
    console.log(err);
    res.status(501).send(err);
  }
});

/**
 * API: localhost:3000/api/users/
 * register new user
 * Params: name, email, password
 */

userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, Vpassword } = req.body;

    if (!name || !email || !password || !Vpassword) {
      return res.status(400).json({ state: "please enter all the inputs" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ state: "password should contain atlesast 8 char" });
    }

    if (password !== Vpassword) {
      return res.status(400).json({ state: "please check the password" });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({ state: "user already exists" });
    }

    var salt = await bcrypt.genSalt();
    var passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: passwordHash,
      isAdmin: true,
    });
    const saveUser = await newUser.save();

    const cart = new Cart({
      user: saveUser._id,
    });

    const saveCart = await cart.save({});
    var updatedUser = {
      name: req.body.name,
      email: req.body.email,
      password: passwordHash,
      cartId: saveCart._id,
    };
    const update = await User.findByIdAndUpdate(saveUser._id, updatedUser);
    console.log(update);

    const token = jwt.sign(
      { userId: saveUser._id },
      process.env.JWT_SECRET || "somethingsecret"
    );

    const url = `http://localhost:5000/api/confirmation/${token}`;

    var mailOptions = {
      from: "support@sillicon14.com",
      to: email,
      subject: "verification Silicon14.com",
      html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    /* res.cookie("token", token, {httpOnly: true}).send(saveUser._id); */
    res.send({
      _id: saveUser._id,
      name: saveUser.name,
      email: saveUser.email,
      cartId: saveCart._id,
      isAdmin: saveUser.isAdmin,
      /*  token: generateToken(saveUser),*/
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

//delete
userRouter.get("/logout", (req, res) => {
  res.clearCookie("token").end("logedOut");
});

/**
 * API: localhost:3000/api/users/:id
 * search user by user_ID
 * params:userID
 */

userRouter.get("/:id", (req, res) => {
  User.findById(req.params.id, function (err, user) {
    if (err) res.status(404).send({ message: "User Not Found" });
    else res.send(user);
  });
});

/**
 * API: localhost:3000/api/users/populateUsers
 * To get list of all the existing users
 */

userRouter.get("/populateUsers", (req, res) => {
  User.insertMany(data.users, {}, function (err, result) {
    if (err) res.status(500).send(err);
    else res.send(result);
  });
});

userRouter.get("/isLogedIn", async (req, res) => {
  try {
    var token = req.cookies.token;

    var verify = jwt.verify(token, process.env.JWT_SECRET || "somethingsecret");

    if (!verify) {
      var data = { userId: false, islogedin: false };
      res.send(false);
    }
    var data = { userId: verify.userId, islogedin: true };
    res.send(data);
  } catch (err) {
    res.send(false);
  }
});

/**
 * API: localhost:3000/api/users/
 * Admin to get all user
 * Params: user_ID
 */
userRouter.get("/", isAuth, isAdmin, (req, res) => {
  User.find({}, function (err, users) {
    if (err) console.log(err);
    else res.send(users);
  });
});

/**
 * API: localhost:3000/api/users/:id
 * Delete user
 * Params: user_ID
 */
userRouter.delete("/:id", isAuth, isAdmin, (req, res) => {
  User.findById(req.params.id, {}, {}, function (err, user) {
    if (err) {
      res.status(404).send({ message: "User Not Found" });
    } else {
      user
        .remove()
        .then((deleteUser) =>
          res.send({ message: "User Deleted", user: deleteUser._id })
        );
    }
  });
});

/**
 * API: localhost:3000/api/users/:id
 * To update user information
 * Params: user_ID
 */

userRouter.put("/:id", (req, res) => {
  User.findById(req.params.id, {}, {}, function (err, user) {
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      user.cartId = req.body.cartId;
      user
        .save()
        .then((updatedUser) =>
          res.send({ message: "User Updated", user: updatedUser })
        );
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  });
});

export default userRouter;
