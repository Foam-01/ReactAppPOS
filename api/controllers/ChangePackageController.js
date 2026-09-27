const express = require("express");
const router = express.Router();
const Service = require("./Service");
const ChangePackageModel = require("../models/ChangePackageModel");
const MemberModel = require("../models/MemberModel");
const PackageModel = require("../models/PackageModel");
const { Op } = require("sequelize");

router.get("/changePackage/list", Service.isAdmin, async (req, res) => {
  try {

    const results = await ChangePackageModel.findAll({
      order: [["id", "DESC"]],
      include: [{ model: PackageModel }, { model: MemberModel }],
      where: { payDate: null },
    });

    res.send({ message: "success", results: results });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.post("/changePackage/saveChange", Service.isAdmin, async (req, res) => {
  try {
    await ChangePackageModel.update(
      {
        payDate: req.body.payDate,
        payHour: req.body.payHour,
        payMinute: req.body.payMinute,
        payRemark: req.body.remark,
      },
      {
        where: { id: req.body.id },
      },
    );
    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

// ดึงรายการที่ชำระแล้วในช่วง [from, to) ด้วย query เดียว
// (เดิม query แยกทีละวัน/เดือน/ปีด้วย EXTRACT ซึ่งใช้ index ไม่ได้)
// ช่วงเวลาคิดตามเวลาไทย (process.env.TZ = Asia/Bangkok ใน app.js)
const findPaidBetween = (from, to) => {
  return ChangePackageModel.findAll({
    where: {
      payDate: { [Op.ne]: null },
      createdAt: { [Op.gte]: from, [Op.lt]: to },
    },
    order: [["id", "ASC"]],
    include: [
      { model: PackageModel, attributes: ["name", "price"] },
      { model: MemberModel, attributes: ["name", "phone"] },
    ],
  });
};

// แยกผลลัพธ์ลงกลุ่มตาม key แล้วรวมราคาแพ็กเกจของแต่ละกลุ่ม
const groupWithSum = (results, groups, keyOf) => {
  for (const item of results) {
    const group = groups.find((g) => g.key === keyOf(new Date(item.createdAt)));
    if (!group) continue;
    group.row.results.push(item);
    // 🌟 ดักจับปลอดภัย: เช็คทั้ง Package (P ใหญ่) และ package (p เล็ก)
    const packagePrice = item.Package?.price || item.package?.price || 0;
    group.row.sum += parseInt(packagePrice);
  }
  return groups.map((g) => g.row);
};

// --- รายงานรายวัน ---
router.post(
  "/changePackage/reportSumSalePerDay",
  Service.isAdmin,
  async (req, res) => {
    try {
      let y = parseInt(req.body.year);
      let m = parseInt(req.body.month);
      let daysInMonth = new Date(y, m, 0).getDate();

      const results = await findPaidBetween(
        new Date(y, m - 1, 1),
        new Date(y, m, 1),
      );

      const groups = [];
      for (let i = 1; i <= daysInMonth; i++) {
        groups.push({ key: i, row: { day: i, results: [], sum: 0 } });
      }
      const arr = groupWithSum(results, groups, (d) => d.getDate());

      res.send({ message: "success", results: arr });
    } catch (e) {
      Service.sendError(res, e);
    }
  },
);

// --- รายงานรายเดือน ---
router.post(
  "/changePackage/reportSumSalePerMonth",
  Service.isAdmin,
  async (req, res) => {
    try {
      let y = parseInt(req.body.year);

      const results = await findPaidBetween(
        new Date(y, 0, 1),
        new Date(y + 1, 0, 1),
      );

      const groups = [];
      for (let i = 1; i <= 12; i++) {
        groups.push({ key: i, row: { month: i, results: [], sum: 0 } });
      }
      const arr = groupWithSum(results, groups, (d) => d.getMonth() + 1);

      res.send({ message: "success", results: arr });
    } catch (e) {
      Service.sendError(res, e);
    }
  },
);

// --- รายงานรายปี ---
router.get(
  "/changePackage/reportSumsalePreYear",
  Service.isAdmin,
  async (req, res) => {
    try {
      const myDate = new Date();
      const y = myDate.getFullYear();
      const startYear = y - 10;

      const results = await findPaidBetween(
        new Date(startYear, 0, 1),
        new Date(y + 1, 0, 1),
      );

      const groups = [];
      for (let i = startYear; i <= y; i++) {
        groups.push({ key: i, row: { year: i, results: [], sum: 0 } });
      }
      const arr = groupWithSum(results, groups, (d) => d.getFullYear());

      res.send({ message: "success", results: arr });
    } catch (e) {
      Service.sendError(res, e);
    }
  },
);

module.exports = router;
