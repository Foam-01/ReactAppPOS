const express = require("express");
const app = express();
const AdminModel = require("../models/AdminModel");
const jwt = require("jsonwebtoken");
const Service = require("./Service");
const { where } = require("sequelize");
const e = require("express");

app.post("/admin/signin", async (req, res) => {
  try {
    const admin = await AdminModel.findOne({
      where: {
        usr: req.body.usr,
        pwd: req.body.pwd,
      },
    });

    if (admin != null) {
      let token = jwt.sign({ id: admin.id }, process.env.secret);
      // ใช้ return เพื่อให้จบฟังก์ชันทันที ไม่ไปรันบรรทัดล่างต่อ
      return res.send({ token: token, message: "success" });
    }

    // ถ้าไม่เจอ user จะลงมาทำงานที่นี่เพียงครั้งเดียว
    res.status(401).send({ message: "not found" });
  } catch (e) {
    // ป้องกันกรณีเกิด error หลังจากส่ง headers ไปแล้ว
    if (!res.headersSent) {
      res.status(500).send({ message: e.message });
    }
  }
});

app.get("/admin/info", Service.isLogin, async (req, res, next) => {
  try {
    const adminId = Service.getAdminId(req);
    const admin = await AdminModel.findByPk(adminId, {
      attributes: ["id", "name", "level", "usr"],
    });

    res.send({ result: admin, message: "success" });
  } catch (e) {
    res.statusCode = 500;
    return res.send({ message: e.message });
  }
});

app.post("/admin/create", Service.isLogin, async (req, res) => {
  try {
    await AdminModel.create(req.body);
    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    return res.send({ message: e.message });
  }
});

app.get("/admin/list", Service.isLogin, async (req, res) => {
  try {
    const results = await AdminModel.findAll({
      attributes: ["email", "name", "level", "usr", "id"],
    });
    res.send({ results: results, message: "success" });
  } catch (e) {
    res.statusCode = 500;
    return res.send({ message: e.message });
  }
});

app.delete("/admin/delete/:id", Service.isLogin, async (req, res) => {
  try {
    await AdminModel.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    return res.send({ message: e.message });
  }
});

app.post("/admin/edit/:id", Service.isLogin, async (req, res) => {
  try {
    await AdminModel.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    return res.send({ message: e.message });
  }
});

app.post("/admin/ChangeProfile", Service.isLogin, async (req, res) => {
  try {
    await AdminModel.update(req.body, {
      where: {
        id: req.body.id,
      },
    });

    res.send({ message: "success" });
  } catch (e) {
    res.statusCode = 500;
    return res.send({ message: e.message });
  }
});

module.exports = app;
