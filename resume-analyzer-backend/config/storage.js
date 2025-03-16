// config/storage.js
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

module.exports = bucket;
