const express = require("express");
const { postPredictHandler } = require("./handler");

const router = express.Router();

router.post("/predict", postPredictHandler);

module.exports = router;