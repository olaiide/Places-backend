const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config();
const placesRoute = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/https-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoute);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(
    process.env.MONGO_URI,
  )
  .then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => {
    console.log(err);
  });
