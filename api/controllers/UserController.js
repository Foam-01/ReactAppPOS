const express = require("express");
const router = express.Router();
const Service = require("./Service");
const UserModel = require("../models/UserModel");

const USER_FIELDS = ["name", "usr", "level"];

const buildUserPayload = async (body) => {
  const payload = Service.pick(body, USER_FIELDS);
  if (typeof body.pwd === "string" && body.pwd.length > 0) {
    payload.pwd = await Service.hashPassword(body.pwd);
  }
  return payload;
};

router.get("/user/list", Service.isMember, async (req, res) => {
  try {
    const results = await UserModel.findAll({
      where: {
        userId: Service.getMemberId(req),
      },
      attributes: ["id", "level", "name", "usr"],
      order: [["id", "DESC"]],
    });
    res.send({ message: "success", results: results });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.post("/user/insert", Service.isMember, async (req, res) => {
  try {
    const payload = await buildUserPayload(req.body);
    payload.userId = Service.getMemberId(req);
    await UserModel.create(payload);
    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.delete("/user/delete/:id", Service.isMember, async (req, res) => {
  try {
    await UserModel.destroy({
      where: {
        id: req.params.id,
        userId: Service.getMemberId(req),
      },
    });
    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.post("/user/edit", Service.isMember, async (req, res) => {
  try {
    await UserModel.update(await buildUserPayload(req.body), {
      where: {
        id: req.body.id,
        userId: Service.getMemberId(req),
      },
    });
    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

module.exports = router;
