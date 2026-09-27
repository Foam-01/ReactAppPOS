const express = require("express");
const router = express.Router();
const Service = require("./Service");
const BankModel = require("../models/BankModel");

router.get("/bank/list", async (req, res) => {
  try {
    const results = await BankModel.findAll();
    res.send({ message: "success", results: results });
  } catch (e) {
    Service.sendError(res, e);
  }
});

module.exports = router;
