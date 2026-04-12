const express = require("express");
const app = express();
const Service = require("./Service");
const ChangePackageModel = require("../models/changePackageModel");

app.get("/changePackage/list", Service.isLogin, async (req, res) => {
  try {
    const PackageModel = require("../models/PackageModel");
    const MembersModel = require("../models/MemberModel");

    ChangePackageModel.belongsTo(PackageModel);
    ChangePackageModel.belongsTo(MembersModel, {
      foreignKey: {
        name: "userId",
      },
    });

    const results = await ChangePackageModel.findAll({
      order: [["id", "DESC"]],
      include: [
        {
          model: PackageModel,
        },
        {
          model: MembersModel,
        },
      ],
      where: {
        payDate: null,
      },
    });

    res.send({ message: "success", results: results });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

app.post("/changePackage/saveChange", Service.isLogin, async (req, res) => {
  try {
    // ✅ เลือกอัปเดตเฉพาะฟิลด์ที่เกี่ยวข้องกับการชำระเงิน ห้ามเอา req.body ยัดลงไปตรงๆ
    await ChangePackageModel.update(
      {
        payDate: req.body.payDate,
        payHour: req.body.payHour,
        payMinute: req.body.payMinute,
        remark: req.body.remark,
        // status: "approved" // ถ้าใน Database มีคอลัมน์ status
      },
      {
        where: {
          id: req.body.id, // ✅ ค้นหาจาก req.body.id ที่เราส่งมาจาก Frontend
        },
      },
    );

    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

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

      ChangePackageModel.belongsTo(PackageModel);
      ChangePackageModel.belongsTo(MemberModel, {
        foreignKey: {
          name: "userId",
        },
      });

      const { Sequelize, Op } = require("sequelize");

      for (let i = 1; i <= daysInMonth; i++) {
        const results = await ChangePackageModel.findAll({
          where: {
            payDate: {
              [Op.ne]: null,
            },
            [Op.and]: [
              Sequelize.fn(
                'EXTRACT(YEAR from "changePackage"."createdAt") = ',
                y,
              ),
              Sequelize.fn(
                'EXTRACT(MONTH from "changePackage"."createdAt") = ',
                m,
              ),
              Sequelize.fn(
                'EXTRACT(DAY from "changePackage"."createdAt") = ',
                i,
              ),
            ],
          },
          include: [
            {
              model: PackageModel,
              attributes: ["name", "price"],
            },
            {
              model: MemberModel,
              attributes: ["name", "phone"],
            },
          ],
          //logging: true,
        });

        let sum = 0;

        for (let j = 0; j < results.length; j++) {
          const item = results[j];
          sum += parseInt(item.package.price); 
        }

        arr.push({
          day: i,
          results: results,
          sum: sum,
        });
      }

      res.send({ message: "success", results: arr });
    } catch (e) {
      res.statusCode = 500;
      res.send({ message: e.message });
    }
  },
);


app.post(
  "/changePackage/reportSumSalePerMonth",
  Service.isLogin,
  async (req, res) => {
    try {
      let arr = [];
      let y = parseInt(req.body.year);

      const MemberModel = require("../models/MemberModel");
      const PackageModel = require("../models/PackageModel");

      ChangePackageModel.belongsTo(PackageModel);
      ChangePackageModel.belongsTo(MemberModel, {
        foreignKey: {
          name: "userId",
        },
      });

      const { Sequelize, Op } = require("sequelize");

      for (let i = 1; i <= 12; i++) {
        const results = await ChangePackageModel.findAll({
          where: {
            payDate: {
              [Op.ne]: null,
            },
            [Op.and]: [
              Sequelize.fn(
                'EXTRACT(YEAR from "changePackage"."createdAt") = ',
                y,
              ),
              Sequelize.fn(
                'EXTRACT(MONTH from "changePackage"."createdAt") = ',
                i,
              ),
              
            ],
          },
          include: [
            {
              model: PackageModel,
              attributes: ["name", "price"],
            },
            {
              model: MemberModel,
              attributes: ["name", "phone"],
            },
          ],
          //logging: true,
        });

        let sum = 0;

        for (let j = 0; j < results.length; j++) {
          const item = results[j];
          sum += parseInt(item.package.price);
        }

        arr.push({
          month: i,
          results: results,
          sum: sum,
        });
      }

      res.send({ message: "success", results: arr });
    } catch (e) {
      res.statusCode = 500;
      res.send({ message: e.message });
    }
  },
);


app.get(
  "/changePackage/reportSumsalePreYear",Service.isLogin, async (req, res) => {
    try {
      const myDate = new Date();
      let arr = [];
      const y = myDate.getFullYear();
      const startYear = y - 10;

      const MemberModel = require("../models/MemberModel");
      const PackageModel = require("../models/PackageModel");

      ChangePackageModel.belongsTo(PackageModel);
      ChangePackageModel.belongsTo(MemberModel, {
        foreignKey: {
          name: "userId",
        },
      });

      const { Sequelize, Op } = require("sequelize");

      for (let i = startYear; i <= y; i++) {
        const results = await ChangePackageModel.findAll({
          where: {
            payDate: {
              [Op.ne]: null,
            },
            [Op.and]: [
              Sequelize.fn(
                'EXTRACT(YEAR from "changePackage"."createdAt") = ',
                i,
              ),
            ],
          },
          include: [
            {
              model: PackageModel,
              attributes: ["name", "price"],
            },
            {
              model: MemberModel,
              attributes: ["name", "phone"],
            },
          ],
          //logging: true,
        });

        let sum = 0;

        for (let j = 0; j < results.length; j++) {
          const item = results[j];
          sum += parseInt(item.package.price);
        }

        arr.push({
          year: i,
          results: results,
          sum: sum,
        });
      }

      res.send({ message: "success", results: arr });
    } catch (e) {
      res.statusCode = 500;
      res.send({ message: e.message });
    }
  },
);

module.exports = app;
