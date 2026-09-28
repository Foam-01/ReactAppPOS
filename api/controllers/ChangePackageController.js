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

// เลขจำนวนเต็มในช่วง [min, max] (รับทั้ง number และข้อความตัวเลข) ไม่ผ่านคืน null
const intInRange = (value, min, max) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

// ปี/เดือนของรายงาน: ช่วงเดียวกับ /billSale/listByYearAndMonth
const YEAR_MIN = 2000;
const YEAR_MAX = 2100;
const BAD_PERIOD = { message: "ปี/เดือนไม่ถูกต้อง" };

router.post("/changePackage/saveChange", Service.isAdmin, async (req, res) => {
  try {
    const id = Service.toPositiveInt(req.body.id);
    const payDate = req.body.payDate;
    const payHour = intInRange(req.body.payHour, 0, 23);
    const payMinute = intInRange(req.body.payMinute, 0, 59);
    const validDate =
      (typeof payDate === "string" || payDate instanceof Date) &&
      !Number.isNaN(new Date(payDate).getTime());
    if (!id || !validDate || payHour === null || payMinute === null) {
      return res.status(400).send({ message: "ข้อมูลการชำระเงินไม่ถูกต้อง" });
    }
    if (req.body.remark !== undefined && typeof req.body.remark !== "string") {
      return res.status(400).send({ message: "หมายเหตุไม่ถูกต้อง" });
    }

    const [updated] = await ChangePackageModel.update(
      {
        payDate,
        payHour,
        payMinute,
        payRemark: req.body.remark,
      },
      {
        where: { id },
      },
    );
    if (!updated) {
      return res.status(404).send({ message: "ไม่พบคำขอเปลี่ยนแพ็กเกจ" });
    }
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
      const y = intInRange(req.body.year, YEAR_MIN, YEAR_MAX);
      const m = intInRange(req.body.month, 1, 12);
      if (y === null || m === null) return res.status(400).send(BAD_PERIOD);
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
      const y = intInRange(req.body.year, YEAR_MIN, YEAR_MAX);
      if (y === null) return res.status(400).send(BAD_PERIOD);

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
