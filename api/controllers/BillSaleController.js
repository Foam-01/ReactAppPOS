const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const service = require("./Service");

const BillSaleModel = require("../models/Temp3");
const BillSaleDetailModel = require("../models/BillSaleDetailModel");
const { where, Sequelize } = require("sequelize");

app.get("/billSale/openBill", service.isLogin, async (req, res) => {
  try {
    const payload = {
      userId: service.getMemberId(req),
      status: "open",
    };
    let result = await BillSaleModel.findOne({
      where: payload,
    });

    if (result == null) {
      result = await BillSaleModel.create(payload);
    }

    res.send({ message: "success", result: result });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

app.post("/billSele/sele", service.isLogin, async (req, res) => {
  try {
    const payload = {
      userId: service.getMemberId(req),
      status: "open",
    };

    const currentBill = await BillSaleModel.findOne({
      where: payload,
    });

    const item = {
      price: req.body.price,
      productId: req.body.id,
      billSaleId: currentBill.id,
      userId: payload.userId,
    };

    const billSaleDetail = await BillSaleDetailModel.findOne({
      where: item,
    });

    if (billSaleDetail == null) {
      item.qty = 1;

      await BillSaleDetailModel.create(item);
    } else {
      item.qty = parseInt(billSaleDetail.qty) + 1;
      await BillSaleDetailModel.update(item, {
        where: {
          id: billSaleDetail.id,
        },
      });
    }

    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

app.get("/billSale/currentBillInfo", service.isLogin, async (req, res) => {
  try {
    const BillSaleDetailModel = require("../models/BillSaleDetailModel");
    const ProductModel = require("../models/ProductModel");

    BillSaleModel.hasMany(BillSaleDetailModel);
    BillSaleDetailModel.belongsTo(ProductModel);

    const results = await BillSaleModel.findOne({
      where: {
        status: "open",
        userId: service.getMemberId(req),
      },
      include: {
        model: BillSaleDetailModel,
        order: [["id", "DESC"]],
        include: {
          model: ProductModel,
          attributes: ["name"],
        },
      },
    });
    res.send({ message: "success", results: results });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

app.delete("/billSale/deleteItem/:id", service.isLogin, async (req, res) => {
  try {
    await BillSaleDetailModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: "success" });
  }
});

app.post("/billSale/updateQty", service.isLogin, async (req, res) => {
  try {
    await BillSaleDetailModel.update(
      {
        qty: req.body.qty,
      },
      {
        where: {
          id: req.body.id,
        },
      },
    );

    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: "success" });
  }
});

app.get("/billSale/endSale", service.isLogin, async (req, res) => {
  try {
    await BillSaleModel.update(
      {
        status: "pay",
      },
      {
        where: {
          status: "open",
          userId: service.getMemberId(req),
        },
      },
    );

    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: "success" });
  }
});

app.get("/billSale/lastBill", service.isLogin, async (req, res) => {
  try {
    const BillSaleDetailModel = require("../models/BillSaleDetailModel");
    const ProductModel = require("../models/ProductModel");

    BillSaleModel.hasMany(BillSaleDetailModel);
    BillSaleDetailModel.belongsTo(ProductModel);

    const result = await BillSaleModel.findAll({
      where: {
        status: "pay",
        userId: service.getMemberId(req),
      },
      order: [["id", "DESC"]],
      limit: 1,
      include: {
        model: BillSaleDetailModel,
        attributes: ["qty", "price"],
        include: {
          model: ProductModel,
          attributes: ["barcode", "name"],
        },
      },
    });

    res.send({ message: "success", result: result });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

app.get("/billSale/billToday", service.isLogin, async (req, res) => {
  try {
    const BillSaleDetailModel = require("../models/BillSaleDetailModel");
    const ProductModel = require("../models/ProductModel");

    BillSaleModel.hasMany(BillSaleDetailModel);
    BillSaleDetailModel.belongsTo(ProductModel);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(23, 59, 59, 59);

    const { Sequelize } = require("sequelize");
    const Op = Sequelize.Op;

    const results = await BillSaleModel.findAll({
      where: {
        status: "pay",
        userId: service.getMemberId(req),
        // เปลี่ยนจาก createdAt เป็น updatedAt
        updatedAt: {
          [Op.between]: [
            startDate, // ไม่ต้องใช้ .toISOString() ก็ได้ Sequelize จัดการให้ครับ
            now,
          ],
        },
      },
      order: [["id", "DESC"]],

      include: {
        model: BillSaleDetailModel,
        attributes: ["qty", "price"],
        include: {
          model: ProductModel,
          attributes: ["barcode", "name"],
        },
      },
    });

    res.send({ message: "success", results: results });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

app.get("/billSale/list", service.isLogin, async (req, res) => {
  const BillSaleDetailModel = require("../models/BillSaleDetailModel");
  const ProductModel = require("../models/ProductModel");

  BillSaleModel.hasMany(BillSaleDetailModel);
  BillSaleDetailModel.belongsTo(ProductModel);

  try {
    const results = await BillSaleModel.findAll({
      order: [["id", "DESC"]],
      where: {
        status: "pay",
        userId: service.getMemberId(req),
      },
      include: {
        model: BillSaleDetailModel,
        include: {
          model: ProductModel,
        },
      },
    });

    res.send({ message: "success", results: results });
  } catch (e) {
    res.statusCode = 500;
    res.send({ message: e.message });
  }
});

app.get(
  "/billSale/listByYearAndMonth/:year/:month",
  service.isLogin,
  async (req, res) => {
    try {
      const { Sequelize, Op } = require("sequelize");
      const BillSaleDetailModel = require("../models/BillSaleDetailModel");
      const ProductModel = require("../models/ProductModel");

      // ตรวจสอบ Association
      BillSaleModel.hasMany(BillSaleDetailModel);
      BillSaleDetailModel.belongsTo(ProductModel);

      let arr = [];
      let y = parseInt(req.params.year);
      let m = parseInt(req.params.month);
      let daysInMonth = new Date(y, m, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        // สร้างช่วงเวลาเริ่มต้นและสิ้นสุดของวันนั้นๆ เพื่อใช้แทน EXTRACT ที่มักมีปัญหา
        const startDate = new Date(y, m - 1, i, 0, 0, 0);
        const endDate = new Date(y, m - 1, i, 23, 59, 59);

        const results = await BillSaleModel.findAll({
          where: {
            userId: service.getMemberId(req), // กรองเฉพาะของผู้ใช้งานนั้นๆ
            status: "pay",
            createdAt: {
              [Op.between]: [startDate, endDate], // ใช้ Op ที่ปลอดภัยกว่า
            },
          },
          include: {
            model: BillSaleDetailModel,
            include: {
              model: ProductModel,
            },
          },
        });

        let sum = 0;
        for (let j = 0; j < results.length; j++) {
          const result = results[j];

          // แก้จุดที่ผิด: เปลี่ยนจาก billSaleDetail เป็น billSaleDetails (เติม s)
          // และเพิ่มเงื่อนไขเช็คว่ามีข้อมูลหรือไม่
          if (result.billSaleDetails && result.billSaleDetails.length > 0) {
            for (let k = 0; k < result.billSaleDetails.length; k++) {
              const item = result.billSaleDetails[k];
              sum += parseInt(item.qty) * parseInt(item.price);
            }
          }
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

module.exports = app;
