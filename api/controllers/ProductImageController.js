const express = require("express");
const Service = require("./Service");
const router = express.Router();
const ProductImageModel = require("../models/ProductImageModel");
const ProductModel = require("../models/ProductModel");
const fileUpload = require("express-fileupload");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ตรวจชนิดไฟล์จากเนื้อไฟล์จริง (magic bytes) ไม่เชื่อชื่อไฟล์หรือ mimetype จาก client
const detectImageExt = (buf) => {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  ) {
    return "png";
  }
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  if (buf.toString("ascii", 0, 3) === "GIF") return "gif";
  return null;
};

// ตรวจว่าสินค้าเป็นของ member ที่ login อยู่
const ownsProduct = async (req, productId) => {
  if (!Service.toPositiveInt(productId)) return false;
  const product = await ProductModel.findOne({
    where: { id: productId, userId: Service.getMemberId(req) },
    attributes: ["id"],
  });
  return product !== null;
};

router.use(
  "/productImage",
  fileUpload({
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    abortOnLimit: true,
    responseOnLimit: JSON.stringify({ message: "ไฟล์ใหญ่เกิน 5MB" }),
  }),
);

router.post("/productImage/insert", Service.isMember, async (req, res) => {
  try {
    const productImage = req.files && req.files.productImage;
    if (!productImage || Array.isArray(productImage)) {
      return res.status(400).send({ message: "กรุณาเลือกไฟล์รูปภาพ" });
    }

    if (!(await ownsProduct(req, req.body.productId))) {
      return res.status(403).send({ message: "forbidden" });
    }

    const ext = detectImageExt(productImage.data);
    if (!ext) {
      return res
        .status(400)
        .send({ message: "รองรับเฉพาะไฟล์ jpg, png, webp, gif" });
    }

    const fullNewName = crypto.randomUUID() + "." + ext;
    await productImage.mv(path.join(UPLOAD_DIR, fullNewName));

    await ProductImageModel.create({
      isMain: false,
      imageName: fullNewName,
      productId: req.body.productId,
    });

    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.get("/productImage/list/:productId", Service.isMember, async (req, res) => {
  try {
    if (!(await ownsProduct(req, req.params.productId))) {
      return res.status(403).send({ message: "forbidden" });
    }
    const results = await ProductImageModel.findAll({
      where: {
        productId: req.params.productId,
      },
      order: [["id", "DESC"]],
    });
    res.send({ message: "success", results: results });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.delete("/productImage/delete/:id", Service.isMember, async (req, res) => {
  try {
    const row = await ProductImageModel.findByPk(req.params.id);

    if (!row || !(await ownsProduct(req, row.productId))) {
      return res.status(404).send({ message: "ไม่พบข้อมูลรูปภาพ" });
    }

    // กัน path traversal: ใช้เฉพาะชื่อไฟล์ และต้องอยู่ในโฟลเดอร์ uploads
    const filePath = path.join(UPLOAD_DIR, path.basename(row.imageName));
    if (filePath.startsWith(UPLOAD_DIR + path.sep) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await ProductImageModel.destroy({
      where: { id: row.id },
    });

    res.send({ message: "success" });
  } catch (e) {
    Service.sendError(res, e);
  }
});

router.get(
  "/productImage/chooseMainImage/:id/:productId",
  Service.isMember,
  async (req, res) => {
    try {
      if (!(await ownsProduct(req, req.params.productId))) {
        return res.status(403).send({ message: "forbidden" });
      }

      await ProductImageModel.update(
        {
          isMain: false,
        },
        {
          where: {
            productId: req.params.productId,
          },
        },
      );

      await ProductImageModel.update(
        {
          isMain: true,
        },
        {
          where: {
            id: req.params.id,
            productId: req.params.productId,
          },
        },
      );

      res.send({ message: "success" });
    } catch (e) {
      Service.sendError(res, e);
    }
  },
);

module.exports = router;
