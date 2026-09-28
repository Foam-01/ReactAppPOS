const express = require("express");
const router = express.Router();
const Service = require("./Service");
const BankModel = require("../models/BankModel");

router.get("/bank/list", async (req, res) => {
  try {
    const results = await BankModel.findAll();
    // ข้อมูลสาธารณะ เปลี่ยนน้อย: ให้เบราว์เซอร์/CDN เก็บ 5 นาที
    res.set("Cache-Control", "public, max-age=300");
    res.send({ message: "success", results: results });
  } catch (e) {
    Service.sendError(res, e);
  }
});

module.exports = router;
