const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

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
    `mongodb+srv://Kolade:Olaide@cluster0.wygvx.mongodb.net/Places?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => {
    console.log(err);
  });
