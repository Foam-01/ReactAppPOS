const express = require("express");
const MemberModel = require("../models/MemberModel");
const router = express.Router();
const service = require("./Service");
const PackageModal = require("../models/PackageModel");

router.post("/member/signin", async (req, res) => {
  try {
    const { phone, pass } = req.body || {};
    if (typeof phone !== "string" || typeof pass !== "string") {
      return res.status(401).send({ message: "not found" });
    }

    const member = await MemberModel.findOne({ where: { phone } });
    const check = member
      ? await service.checkPassword(pass, member.pass)
      : { ok: false };

    if (!check.ok) {
      return res.status(401).send({ message: "not found" });
    }

    // ย้ายรหัสเดิมที่เป็น plaintext ไปเป็น bcrypt อัตโนมัติ
    if (check.needsRehash) {
      await member.update({ pass: await service.hashPassword(pass) });
    }

    const token = service.signToken(member.id, "member");
    return res.send({ token: token, message: "success" });
  } catch (e) {
    service.sendError(res, e);
  }
});

router.get("/member/info", service.isMember, async (req, res) => {
  try {
    const member = await MemberModel.findByPk(service.getMemberId(req), {
      attributes: ["id", "name"],
      include: [
        {
          model: PackageModal,
          attributes: ["name", "bill_amount"],
        },
      ],
    });

    res.send({ result: member, message: "success" });
  } catch (e) {
    service.sendError(res, e);
  }
});

router.put("/member/changeProfile", service.isMember, async (req, res) => {
  try {
    const name = req.body.memberName;
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).send({ message: "กรุณาระบุชื่อ" });
    }
    const result = await MemberModel.update(
      { name: name.trim() },
      { where: { id: service.getMemberId(req) } },
    );

    res.send({ message: "success", result: result });
  } catch (e) {
    service.sendError(res, e);
  }
});

router.get("/member/list", service.isAdmin, async (req, res) => {
  try {
    const results = await MemberModel.findAll({
      order: [["id", "DESC"]],
      attributes: ["id", "name", "phone", "createdAt"],
      include: {
        model: PackageModal,
      },
    });
    res.send({ message: "success", results: results });
  } catch (e) {
    service.sendError(res, e);
  }
});

module.exports = router;
