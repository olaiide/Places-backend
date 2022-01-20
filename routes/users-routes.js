const express = require("express");
const { check } = require("express-validator");
const userController = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", userController.getUsers);

router.post(
  "/signup",
  [
    check("name", 'name is required').not().isEmpty(),
    check("email", 'Enter a valid email').normalizeEmail().isEmail(),
    check("password", 'Password must be 6 or more characters ').isLength({ min: 6 }),
  ],
  userController.signup
);

router.post("/login", userController.login);

module.exports = router;
