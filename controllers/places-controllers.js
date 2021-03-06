const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const mongoose = require('mongoose')
const HttpError = require("../models/https-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/places-model");
const User = require('../models/users-model')

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pId;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );
    return next(error);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Fetching places failed, please try again",
      500
    );
    return next(error);
  }
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could  not find places for the provided user id.", 404)
    );
  }
  res
    .status(200)
    .json({ places: places.map((place) => place.toObject({ getters: true })) });
  //res.json({ places })
};
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    const error = new HttpError('Something went wrong, try again later.')
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
 //   location: { ...coordinates },
    image:
      "https://en.wikipedia.org/wiki/File:Empire_State_Building_(aerial_view).jpg",
    creator,
  });
  let user;
  try {
    user = await User.findById(creator)
  }catch {
    const error = new HttpError('Creating place failed, please try again.', 500)
    return next(error)
  }
  if(!user) {
    const error = new HttpError('Could not find user for provided id', 404)
    return next(error)
  }
  try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
     await createdPlace.save({session : sess});
      user.places.push(createdPlace);
    await  user.save({ session : sess});
      await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    console.log(err);
    const error = new HttpError("Something went wrong, Please try again", 500);
    return next(error);
  }
  if (!place) {
    const error = new HttpError("Could not find a place for that id.", 404);
    return next(error);
  }

  try { 
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session : sess});
    place.creator.places.pull(place)
    await place.creator.save({ session : sess})
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Could not delete place, Please try again", 500);
    return next(error);
  }

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
