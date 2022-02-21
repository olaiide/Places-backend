const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/https-error");
const User = require("../models/users-model");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Fetching users failed, Something went wrong"),
      404
    );
  }

  res.status(200).json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
}; 

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (!errors.isEmpty()) {
    //throw new HttpError({error errors.msg}, 422);
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser)
    return next(
      new HttpError("User exists already, please Login instead", 422)
    );
  const createdUser = new User({
    name,
    email,
    password,
    image:
      "https://en.wikipedia.org/wiki/File:Empire_State_Building_(aerial_view).jpg",
    places : [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Could not sign up user, Something went wrong.",
      500
    );
    return next(error);
  }
  res.status(200).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Login failed, Something went wrong.", 500);
    return next(error);
  }

  if (!identifiedUser || identifiedUser.password !== password) {
    return next(new HttpError("Invalid credentials, Login failed"), 401);
  }
  res.status(200).json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
