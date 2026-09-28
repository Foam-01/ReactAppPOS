const express = require("express");
const router = express.Router();
const PackageModel = require("../models/PackageModel");
const MemberModel = require("../models/MemberModel");
const Service = require("./Service");
const ChangePackageModel = require("../models/ChangePackageModel");
const BillSaleModel = require("../models/BillSaleModel");
const { Op } = require("sequelize");
const { BILL_STATUS } = require("../constants");

router.get("/package/list", async (req, res) => {
  try {
    const results = await PackageModel.findAll({
      order: [["price", "ASC"]],
    });
    // ข้อมูลสาธารณะ เปลี่ยนน้อย: ให้เบราว์เซอร์/CDN เก็บ 5 นาที
    res.set("Cache-Control", "public, max-age=300");
    res.send(results);
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.post("/package/memberRegister", async (req, res) => {
  try {
    const { name, phone, pass, packageId } = req.body || {};
    if (
      typeof name !== "string" || !name.trim() ||
      typeof phone !== "string" || !/^[0-9]{9,10}$/.test(phone) ||
      typeof pass !== "string" || pass.length < 6
    ) {
      return res.status(400).send({
        message: "ข้อมูลไม่ถูกต้อง (เบอร์โทร 9-10 หลัก, รหัสผ่านอย่างน้อย 6 ตัว)",
      });
    }

    const pkg = await PackageModel.findByPk(packageId, { attributes: ["id"] });
    if (!pkg) {
      return res.status(400).send({ message: "ไม่พบแพ็กเกจ" });
    }

    const exists = await MemberModel.findOne({ where: { phone } });
    if (exists) {
      return res.status(409).send({ message: "เบอร์โทรนี้ถูกใช้สมัครแล้ว" });
    }

    const result = await MemberModel.create({
      name: name.trim(),
      phone,
      pass: await Service.hashPassword(pass),
      packageId: pkg.id,
    });
    // ไม่ส่งรหัสผ่าน (hash) กลับไปหา client
    res.send({
      message: "success",
      result: { id: result.id, name: result.name, packageId: result.packageId },
    });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.get("/package/countBill", Service.isMember, async (req, res) => {
  try {

    // สร้างวันที่เริ่มต้นของเดือนปัจจุบัน (วันที่ 1 เวลา 00:00:00)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    // สร้างวันที่สิ้นสุดของเดือนปัจจุบัน (วันสุดท้าย เวลา 23:59:59.999)
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // นับในฐานข้อมูล ไม่ต้องดึงทุกแถวมานับ .length
    // เฉพาะบิลที่ชำระแล้ว (ไม่นับบิลที่เปิดค้าง) · กติกาเดียวกับโควตาใน /billSale/endSale
    const totalBill = await BillSaleModel.count({
      where: {
        userId: Service.getMemberId(req),
        status: BILL_STATUS.PAY,
        createdAt: {
          [Op.between]: [startDate, endDate], // ดึงเฉพาะบิลที่เกิดในเดือนนี้เท่านั้น
        },
      },
    });

    res.send({ totalBill: totalBill });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.get("/package/changePackage/:id", Service.isMember, async (req, res) => {
  try {
    const packageId = Service.toPositiveInt(req.params.id);
    if (!packageId) {
      return res.status(400).send({ message: "รหัสแพ็กเกจไม่ถูกต้อง" });
    }
    const pkg = await PackageModel.findByPk(packageId, { attributes: ["id"] });
    if (!pkg) {
      return res.status(404).send({ message: "ไม่พบแพ็กเกจ" });
    }

    const payload = {
      userId: Service.getMemberId(req),
      packageId: pkg.id,
    };

    await ChangePackageModel.create(payload);

    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

module.exports = router;
