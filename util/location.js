const axios = require("axios");
const HttpError = require("../models/https-error");

const API_KEY = "7819ef9711ef4eb881b4b5199e90f0db";

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      address
    )}&apiKey=${API_KEY}`
  );
  const data = response.data;

  if (!data) {
    const error = new HttpError(
      "Could not find coordinates for specified address",
      422
    );
    throw error;
  }

  const coordinates = data.features[0].geometry.coordinates;
  return coordinates;
}

module.exports = getCoordsForAddress;
