const express = require("express");
const router = express.Router();
const AdminModel = require("../models/AdminModel");
const Service = require("./Service");

const ADMIN_FIELDS = ["name", "usr", "level", "email"];

// สร้าง payload จาก body เฉพาะฟิลด์ที่อนุญาต และ hash รหัสผ่านถ้ามี
const buildAdminPayload = async (body) => {
  const payload = Service.pick(body, ADMIN_FIELDS);
  if (typeof body.pwd === "string" && body.pwd.length > 0) {
    payload.pwd = await Service.hashPassword(body.pwd);
  }
  return payload;
};

router.post("/admin/signin", async (req, res) => {
  try {
    const { usr, pwd } = req.body || {};
    if (typeof usr !== "string" || typeof pwd !== "string") {
      return res.status(401).send({ message: "not found" });
    }

    const admin = await AdminModel.findOne({ where: { usr } });
    const check = admin
      ? await Service.checkPassword(pwd, admin.pwd)
      : { ok: false };

    if (!check.ok) {
      return res.status(401).send({ message: "not found" });
    }

    if (check.needsRehash) {
      await admin.update({ pwd: await Service.hashPassword(pwd) });
    }

    const token = Service.signToken(admin.id, "admin");
    return res.send({ token: token, message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.get("/admin/info", Service.isAdmin, async (req, res) => {
  try {
    const admin = await AdminModel.findByPk(Service.getAdminId(req), {
      attributes: ["id", "name", "level", "usr"],
    });

    res.send({ result: admin, message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.post("/admin/create", Service.isAdmin, async (req, res) => {
  try {
    if (typeof req.body.pwd !== "string" || !req.body.pwd) {
      return res.status(400).send({ message: "กรุณาระบุรหัสผ่าน" });
    }
    await AdminModel.create(await buildAdminPayload(req.body));
    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.get("/admin/list", Service.isAdmin, async (req, res) => {
  try {
    const results = await AdminModel.findAll({
      attributes: ["email", "name", "level", "usr", "id"],
    });
    res.send({ results: results, message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.delete("/admin/delete/:id", Service.isAdmin, async (req, res) => {
  try {
    await AdminModel.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.post("/admin/edit/:id", Service.isAdmin, async (req, res) => {
  try {
    await AdminModel.update(await buildAdminPayload(req.body), {
      where: {
        id: req.params.id,
      },
    });

    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

// แก้ได้เฉพาะโปรไฟล์ของตัวเอง (ใช้ id จาก token ไม่ใช่จาก body) และห้ามเปลี่ยน level เอง
router.post("/admin/ChangeProfile", Service.isAdmin, async (req, res) => {
  try {
    const payload = await buildAdminPayload(req.body);
    delete payload.level;
    await AdminModel.update(payload, {
      where: {
        id: Service.getAdminId(req),
      },
    });

    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

module.exports = router;
