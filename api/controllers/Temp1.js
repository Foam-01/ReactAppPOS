const express = require("express");
const app = express();
const Service = require("./Service");
const ChangePackageModel = require("../models/Temp1");

app.get("/changePackage/list", Service.isLogin, async (req, res) => {
  try {
    const PackageModel = require("../models/PackageModel");
    const MembersModel = require("../models/MemberModel");

    ChangePackageModel.belongsTo(PackageModel);
    ChangePackageModel.belongsTo(MembersModel, {
      foreignKey: { name: "userId" },
    });

    const results = await ChangePackageModel.findAll({
      order: [["id", "DESC"]],
      include: [{ model: PackageModel }, { model: MembersModel }],
      where: { payDate: null },
    });

    res.send({ message: "success", results: results });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

app.post("/changePackage/saveChange", Service.isLogin, async (req, res) => {
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
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

// --- รายงานรายวัน ---
app.post(
  "/changePackage/reportSumSalePerDay",
  Service.isLogin,
  async (req, res) => {
    try {
      let arr = [];
      let y = parseInt(req.body.year);
      let m = parseInt(req.body.month);
      let daysInMonth = new Date(y, m, 0).getDate();

      const MemberModel = require("../models/MemberModel");
      const PackageModel = require("../models/PackageModel");
      const { Sequelize, Op } = require("sequelize");

      ChangePackageModel.belongsTo(PackageModel);
      ChangePackageModel.belongsTo(MemberModel, { foreignKey: "userId" });

      for (let i = 1; i <= daysInMonth; i++) {
        const results = await ChangePackageModel.findAll({
          where: {
            payDate: { [Op.ne]: null },
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn(
                  "EXTRACT",
                  Sequelize.literal('YEAR FROM "ChangePackages"."createdAt"'),
                ),
                y,
              ),
              Sequelize.where(
                Sequelize.fn(
                  "EXTRACT",
                  Sequelize.literal('MONTH FROM "ChangePackages"."createdAt"'),
                ),
                m,
              ),
              Sequelize.where(
                Sequelize.fn(
                  "EXTRACT",
                  Sequelize.literal('DAY FROM "ChangePackages"."createdAt"'),
                ),
                i,
              ),
            ],
          },
          include: [
            { model: PackageModel, attributes: ["name", "price"] },
            { model: MemberModel, attributes: ["name", "phone"] },
          ],
        });

        let sum = 0;
        for (let j = 0; j < results.length; j++) {
          // 🌟 ดักจับปลอดภัย: เช็คทั้ง Package (P ใหญ่) และ package (p เล็ก)
          const item = results[j];
          const packagePrice = item.Package?.price || item.package?.price || 0;
          sum += parseInt(packagePrice);
        }

        arr.push({ day: i, results: results, sum: sum });
      }
      res.send({ message: "success", results: arr });
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  },
);

// --- รายงานรายเดือน ---
app.post(
  "/changePackage/reportSumSalePerMonth",
  Service.isLogin,
  async (req, res) => {
    try {
      let arr = [];
      let y = parseInt(req.body.year);
      const MemberModel = require("../models/MemberModel");
      const PackageModel = require("../models/PackageModel");
      const { Sequelize, Op } = require("sequelize");

      ChangePackageModel.belongsTo(PackageModel);
      ChangePackageModel.belongsTo(MemberModel, { foreignKey: "userId" });

      for (let i = 1; i <= 12; i++) {
        const results = await ChangePackageModel.findAll({
          where: {
            payDate: { [Op.ne]: null },
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn(
                  "EXTRACT",
                  Sequelize.literal('YEAR FROM "ChangePackages"."createdAt"'),
                ),
                y,
              ),
              Sequelize.where(
                Sequelize.fn(
                  "EXTRACT",
                  Sequelize.literal('MONTH FROM "ChangePackages"."createdAt"'),
                ),
                i,
              ),
            ],
          },
          include: [
            { model: PackageModel, attributes: ["name", "price"] },
            { model: MemberModel, attributes: ["name", "phone"] },
          ],
        });

        let sum = 0;
        for (let j = 0; j < results.length; j++) {
          // 🌟 ดักจับปลอดภัย
          const item = results[j];
          const packagePrice = item.Package?.price || item.package?.price || 0;
          sum += parseInt(packagePrice);
        }
        arr.push({ month: i, results: results, sum: sum });
      }
      res.send({ message: "success", results: arr });
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  },
);

// --- รายงานรายปี ---
app.get(
  "/changePackage/reportSumsalePreYear",
  Service.isLogin,
  async (req, res) => {
    try {
      const myDate = new Date();
      let arr = [];
      const y = myDate.getFullYear();
      const startYear = y - 10;
      const MemberModel = require("../models/MemberModel");
      const PackageModel = require("../models/PackageModel");
      const { Sequelize, Op } = require("sequelize");

      ChangePackageModel.belongsTo(PackageModel);
      ChangePackageModel.belongsTo(MemberModel, { foreignKey: "userId" });

      for (let i = startYear; i <= y; i++) {
        const results = await ChangePackageModel.findAll({
          where: {
            payDate: { [Op.ne]: null },
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn(
                  "EXTRACT",
                  Sequelize.literal('YEAR FROM "ChangePackages"."createdAt"'),
                ),
                i,
              ),
            ],
          },
          include: [
            { model: PackageModel, attributes: ["name", "price"] },
            { model: MemberModel, attributes: ["name", "phone"] },
          ],
        });

        let sum = 0;
        for (let j = 0; j < results.length; j++) {
          // 🌟 ดักจับปลอดภัย
          const item = results[j];
          const packagePrice = item.Package?.price || item.package?.price || 0;
          sum += parseInt(packagePrice);
        }
        arr.push({ year: i, results: results, sum: sum });
      }
      res.send({ message: "success", results: arr });
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  },
);

module.exports = app;
