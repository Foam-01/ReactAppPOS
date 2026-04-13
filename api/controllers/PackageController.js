const express = require("express");
const app = express();
const PackageModel = require("../models/PackageModel");
const MemberModel = require("../models/MemberModel");
const Service = require("./Service");
const BankModel = require("../models/Temp2");
const ChangePackageModel = require("../models/Temp1");

app.get("/package/list", async (req, res) => {
  try {
    const results = await PackageModel.findAll({
      order: [["price", "ASC"]],
    });
    res.send(results);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

app.post("/package/memberRegister", async (req, res) => {
  try {
    const result = await MemberModel.create(req.body);
    res.send({ message: "success", result: result });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

app.get("/package/countBill", Service.isLogin, async (req, res) => {
  try {
    const BillSaleModel = require("../models/Temp3");
    const { Op } = require("sequelize");

    // สร้างวันที่เริ่มต้นของเดือนปัจจุบัน (วันที่ 1 เวลา 00:00:00)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    // สร้างวันที่สิ้นสุดของเดือนปัจจุบัน (วันสุดท้าย เวลา 23:59:59)
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const results = await BillSaleModel.findAll({
      where: {
        userId: Service.getMemberId(req),
        createdAt: {
          [Op.between]: [startDate, endDate], // ดึงเฉพาะบิลที่เกิดในเดือนนี้เท่านั้น
        },
      },
    });

    res.send({ totalBill: results.length });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

app.get("/package/changePackage/:id", Service.isLogin, async (req, res) => {
  try {
    const payload = {
      userId: Service.getMemberId(req),
      packageId: req.params.id,
    };

    await ChangePackageModel.create(payload);

    res.send({ message: "success" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

module.exports = app;
