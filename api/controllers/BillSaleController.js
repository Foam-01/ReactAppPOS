const express = require("express");
const router = express.Router();
const service = require("./Service");
const ProductModel = require("../models/ProductModel");

const BillSaleModel = require("../models/BillSaleModel");
const BillSaleDetailModel = require("../models/BillSaleDetailModel");
const { Op } = require("sequelize");
const { BILL_STATUS } = require("../constants");
const conn = require("../connect");
const MemberModel = require("../models/MemberModel");
const PackageModel = require("../models/PackageModel");

// คอลัมน์สินค้าที่หน้าเว็บใช้ในรายการบิล (เดิมส่งทุกคอลัมน์รวม detail/cost ซ้ำทุกแถว)
const PRODUCT_BRIEF = ["id", "barcode", "name"];

// ให้คำขอของร้านเดียวกันทำงานทีละคำขอ (กดซ้ำ/หลายเครื่องพร้อมกัน)
// กันบิลเปิดซ้ำ, รายการซ้ำ และ qty หาย (lost update) โดยไม่ต้องแก้ schema
// advisory lock ระดับ transaction: ปลดเองเมื่อ COMMIT/ROLLBACK
const withMemberLock = (memberId, work) =>
  conn.transaction(async (t) => {
    await conn.query("SELECT pg_advisory_xact_lock(:key)", {
      replacements: { key: memberId },
      transaction: t,
    });
    return work(t);
  });

// แก้/ลบรายการได้เฉพาะในบิลที่ยังเปิดอยู่ของร้านตัวเอง (บิลที่ชำระแล้วห้ามแตะ)
// ทำใต้ล็อกเดียวกับ endSale: บิลจะไม่ถูกปิดระหว่างกำลังแก้ · คืนจำนวนแถวที่เปลี่ยน
const changeOpenBillItem = (memberId, detailId, change) =>
  withMemberLock(memberId, async (t) => {
    const openBills = await BillSaleModel.findAll({
      attributes: ["id"],
      where: { userId: memberId, status: BILL_STATUS.OPEN },
      transaction: t,
    });
    if (openBills.length === 0) return 0;
    return change({
      where: {
        id: detailId,
        userId: memberId,
        billSaleId: openBills.map((b) => b.id),
      },
      transaction: t,
    });
  });

const ITEM_NOT_FOUND = { message: "ไม่พบรายการในบิลที่กำลังขาย" };

router.get("/billSale/openBill", service.isMember, async (req, res) => {
  try {
    const payload = {
      userId: service.getMemberId(req),
      status: BILL_STATUS.OPEN,
    };
    const result = await withMemberLock(payload.userId, async (t) => {
      const bill = await BillSaleModel.findOne({
        where: payload,
        transaction: t,
      });
      return bill || BillSaleModel.create(payload, { transaction: t });
    });

    res.send({ message: "success", result: result });
  } catch (e) {
    service.sendError(res, e);
  }
});

router.post("/billSele/sele", service.isMember, async (req, res) => {
  try {
    const payload = {
      userId: service.getMemberId(req),
      status: BILL_STATUS.OPEN,
    };

    // ใช้ราคาจากฐานข้อมูล ไม่เชื่อราคาที่ client ส่งมา และต้องเป็นสินค้าของร้านนี้
    const product = await ProductModel.findOne({
      where: { id: req.body.id, userId: payload.userId },
      attributes: ["id", "price"],
    });
    if (!product) {
      return res.status(404).send({ message: "ไม่พบสินค้า" });
    }

    const added = await withMemberLock(payload.userId, async (t) => {
      const currentBill = await BillSaleModel.findOne({
        where: payload,
        transaction: t,
      });
      if (!currentBill) return false;

      const item = {
        price: product.price,
        productId: product.id,
        billSaleId: currentBill.id,
        userId: payload.userId,
      };

      const billSaleDetail = await BillSaleDetailModel.findOne({
        where: item,
        transaction: t,
      });

      if (billSaleDetail == null) {
        await BillSaleDetailModel.create({ ...item, qty: 1 }, { transaction: t });
      } else {
        // บวกที่ฐานข้อมูล (qty = qty + 1) ไม่ใช้ค่าที่อ่านมา
        await BillSaleDetailModel.increment("qty", {
          by: 1,
          where: { id: billSaleDetail.id },
          transaction: t,
        });
      }
      return true;
    });

    if (!added) {
      return res.status(400).send({ message: "ไม่พบบิลที่เปิดอยู่" });
    }

    res.send({ message: "success" });
  } catch (e) {
    service.sendError(res, e);
  }
});

router.get("/billSale/currentBillInfo", service.isMember, async (req, res) => {
  try {
    
    const results = await BillSaleModel.findOne({
      where: {
        status: BILL_STATUS.OPEN,
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
    service.sendError(res, e);
  }
});

router.delete("/billSale/deleteItem/:id", service.isMember, async (req, res) => {
  try {
    const detailId = service.toPositiveInt(req.params.id);
    const deleted = detailId
      ? await changeOpenBillItem(service.getMemberId(req), detailId, (opts) =>
          BillSaleDetailModel.destroy(opts),
        )
      : 0;
    if (!deleted) return res.status(404).send(ITEM_NOT_FOUND);
    res.send({ message: "success" });
  } catch (e) {
    service.sendError(res, e);
  }
});

router.post("/billSale/updateQty", service.isMember, async (req, res) => {
  try {
    const qty = service.toPositiveInt(req.body.qty);
    if (!qty) {
      return res.status(400).send({ message: "จำนวนไม่ถูกต้อง" });
    }
    const detailId = service.toPositiveInt(req.body.id);
    const updated = detailId
      ? await changeOpenBillItem(service.getMemberId(req), detailId, async (opts) => {
          const [count] = await BillSaleDetailModel.update({ qty }, opts);
          return count;
        })
      : 0;
    if (!updated) return res.status(404).send(ITEM_NOT_FOUND);
    res.send({ message: "success" });
  } catch (e) {
    service.sendError(res, e);
  }
});

router.get("/billSale/endSale", service.isMember, async (req, res) => {
  try {
    // กันบิลว่าง: ต้องมีสินค้าในบิลที่เปิดอยู่อย่างน้อย 1 รายการก่อนปิดการขาย
    const memberId = service.getMemberId(req);
    // ล็อกเดียวกับการเพิ่มสินค้า: ไม่มีสินค้าเข้าบิลระหว่างที่กำลังปิดบิล
    const closed = await withMemberLock(memberId, async (t) => {
      const openBills = await BillSaleModel.findAll({
        attributes: ["id"],
        where: { status: BILL_STATUS.OPEN, userId: memberId },
        transaction: t,
      });
      const itemCount = openBills.length
        ? await BillSaleDetailModel.count({
            where: { billSaleId: openBills.map((b) => b.id) },
            transaction: t,
          })
        : 0;
      if (itemCount === 0) return "empty";

      // โควตาบิลต่อเดือนของแพ็กเกจ: นับบิลที่ชำระแล้วในเดือนนี้ (ช่วงเดียวกับ /package/countBill)
      // แพ็กเกจไม่มีกำหนด (bill_amount ว่างหรือ ≤ 0) = ไม่จำกัด
      const member = await MemberModel.findByPk(memberId, {
        attributes: ["id"],
        include: { model: PackageModel, attributes: ["bill_amount"] },
        transaction: t,
      });
      const quota = Number(member?.package?.bill_amount) || 0;
      if (quota > 0) {
        const now = new Date();
        const paidThisMonth = await BillSaleModel.count({
          where: {
            userId: memberId,
            status: BILL_STATUS.PAY,
            createdAt: {
              [Op.between]: [
                new Date(now.getFullYear(), now.getMonth(), 1),
                new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
              ],
            },
          },
          transaction: t,
        });
        if (paidThisMonth >= quota) return "quota";
      }

      await BillSaleModel.update(
        // payDate: เวลาชำระจริง (เดิมคอลัมน์นี้ไม่เคยถูกบันทึก)
        { status: BILL_STATUS.PAY, payDate: new Date() },
        {
          where: { status: BILL_STATUS.OPEN, userId: memberId },
          transaction: t,
        },
      );
      return "closed";
    });

    if (closed === "empty") {
      return res.status(400).send({ message: "ไม่มีสินค้าในบิล" });
    }
    if (closed === "quota") {
      return res.status(403).send({
        message: "ใช้จำนวนบิลครบตามแพ็กเกจของเดือนนี้แล้ว กรุณาอัปเกรดแพ็กเกจเพื่อขายต่อ",
      });
    }

    res.send({ message: "success" });
  } catch (e) {
    service.sendError(res, e);
  }
});

router.get("/billSale/lastBill", service.isMember, async (req, res) => {
  try {
    
    const result = await BillSaleModel.findAll({
      where: {
        status: BILL_STATUS.PAY,
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
    service.sendError(res, e);
  }
});

router.get("/billSale/billToday", service.isMember, async (req, res) => {
  try {
    // วันนี้ = [00:00 วันนี้, 00:00 พรุ่งนี้) · เดิมปลายช่วงเป็น 23:59:59.059
    // บิลที่ชำระช่วง .060–.999 ของวินาทีสุดท้ายจึงหายจากรายการ
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const results = await BillSaleModel.findAll({
      where: {
        status: BILL_STATUS.PAY,
        userId: service.getMemberId(req),
        // เปลี่ยนจาก createdAt เป็น updatedAt
        updatedAt: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      order: [["id", "DESC"]],

      include: {
        model: BillSaleDetailModel,
        required: true, // ซ่อนบิลว่าง (ไม่มีรายการสินค้า) จากรายงาน
        attributes: ["qty", "price"],
        include: {
          model: ProductModel,
          attributes: ["barcode", "name"],
        },
      },
    });

    res.send({ message: "success", results: results });
  } catch (e) {
    service.sendError(res, e);
  }
});

// ไม่ส่ง page: คืนทุกบิลเหมือนเดิม · ส่ง ?page=&limit=&q= : แบ่งหน้าที่ฐานข้อมูล
// (q = ค้นเลขบิล) แล้วเพิ่ม total/page/limit ในคำตอบ · results โครงเดิม
router.get("/billSale/list", service.isMember, async (req, res) => {
  try {
    const where = {
      status: BILL_STATUS.PAY,
      userId: service.getMemberId(req),
    };
    const query = {
      order: [["id", "DESC"]],
      where,
      include: {
        model: BillSaleDetailModel,
        required: true, // ซ่อนบิลว่าง (ไม่มีรายการสินค้า) จากรายงาน
        include: {
          model: ProductModel,
          attributes: PRODUCT_BRIEF,
        },
      },
    };

    if (req.query.page === undefined) {
      const results = await BillSaleModel.findAll(query);
      return res.send({ message: "success", results: results });
    }

    const page = service.toPositiveInt(req.query.page) || 1;
    const limit = Math.min(service.toPositiveInt(req.query.limit) || 20, 100);
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
      // เหมือนการค้นเดิมฝั่งหน้าเว็บ: เลขบิลที่มีข้อความนี้อยู่
      where[Op.and] = conn.where(conn.cast(conn.col("billSales.id"), "text"), {
        [Op.like]: `%${q.replace(/[\\%_]/g, "\\$&")}%`,
      });
    }

    const { rows, count } = await BillSaleModel.findAndCountAll({
      ...query,
      limit,
      offset: (page - 1) * limit,
      distinct: true,
      col: "id",
    });
    res.send({ message: "success", results: rows, total: count, page, limit });
  } catch (e) {
    service.sendError(res, e);
  }
});

router.get(
  "/billSale/listByYearAndMonth/:year/:month",
  service.isMember,
  async (req, res) => {
    try {
      
      let arr = [];
      let y = parseInt(req.params.year);
      let m = parseInt(req.params.month);
      if (!(y >= 2000 && y <= 2100 && m >= 1 && m <= 12)) {
        return res.status(400).send({ message: "ปี/เดือนไม่ถูกต้อง" });
      }
      let daysInMonth = new Date(y, m, 0).getDate();

      // ดึงทั้งเดือนใน query เดียว แล้วแยกรายวันใน JS (เดิม query วันละครั้ง = 28–31 ครั้ง)
      const results = await BillSaleModel.findAll({
        where: {
          userId: service.getMemberId(req), // กรองเฉพาะของผู้ใช้งานนั้นๆ
          status: BILL_STATUS.PAY,
          // ทั้งเดือน = [วันที่ 1, วันที่ 1 ของเดือนถัดไป) รวมเศษมิลลิวินาทีท้ายวัน
          createdAt: {
            [Op.gte]: new Date(y, m - 1, 1),
            [Op.lt]: new Date(y, m, 1),
          },
        },
        order: [["id", "ASC"]],
        include: {
          model: BillSaleDetailModel,
          required: true, // ซ่อนบิลว่าง (ไม่มีรายการสินค้า) จากรายงาน
          include: {
            model: ProductModel,
            attributes: PRODUCT_BRIEF,
          },
        },
      });

      for (let i = 1; i <= daysInMonth; i++) {
        arr.push({ day: i, results: [], sum: 0 });
      }

      for (const result of results) {
        const d = new Date(result.createdAt);
        const day = arr[d.getDate() - 1];
        day.results.push(result);

        // แก้จุดที่ผิด: เปลี่ยนจาก billSaleDetail เป็น billSaleDetails (เติม s)
        // และเพิ่มเงื่อนไขเช็คว่ามีข้อมูลหรือไม่
        if (result.billSaleDetails && result.billSaleDetails.length > 0) {
          for (const item of result.billSaleDetails) {
            day.sum += parseInt(item.qty) * parseInt(item.price);
          }
        }
      }

      res.send({ message: "success", results: arr });
    } catch (e) {
      service.sendError(res, e);
    }
  },
);

// สรุปสำหรับหน้าภาพรวมร้าน: รวมยอดในฐานข้อมูลแทนการส่งบิลทุกใบไปคำนวณที่หน้าเว็บ
// นับเหมือน /billSale/list: เฉพาะบิลที่ชำระแล้วและมีรายการสินค้า · ยอด = qty × price
router.get("/billSale/summary", service.isMember, async (req, res) => {
  try {
    const userId = service.getMemberId(req);
    const tz = process.env.TZ || "Asia/Bangkok";
    const PAID_ITEMS = `
      FROM "billSales" b
      JOIN "billSaleDetails" d ON d."billSaleId" = b.id
      WHERE b."userId" = :userId AND b.status = :pay`;

    // 7 วันล่าสุดรวมวันนี้ (นับวันตามเวลาไทย)
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    const replacements = { userId, pay: BILL_STATUS.PAY, tz, weekStart };
    const q = (sql) => conn.query(sql, { replacements, type: conn.QueryTypes.SELECT });

    const [[totals], week, top, recentBills, [stock]] = await Promise.all([
      q(`SELECT COUNT(DISTINCT b.id) AS "totalBills",
                COALESCE(SUM(d.qty * d.price), 0) AS "totalSales" ${PAID_ITEMS}`),
      q(`SELECT to_char(b."createdAt" AT TIME ZONE :tz, 'YYYY-MM-DD') AS date,
                SUM(d.qty * d.price) AS total ${PAID_ITEMS}
           AND b."createdAt" >= :weekStart
         GROUP BY 1`),
      q(`SELECT COALESCE(p.name, 'ไม่ระบุชื่อ') AS name, SUM(d.qty) AS qty
         FROM "billSales" b
         JOIN "billSaleDetails" d ON d."billSaleId" = b.id
         LEFT JOIN products p ON p.id = d."productId"
         WHERE b."userId" = :userId AND b.status = :pay
         GROUP BY 1 ORDER BY 2 DESC, 1 ASC LIMIT 5`),
      BillSaleModel.findAll({
        where: { status: BILL_STATUS.PAY, userId },
        order: [["createdAt", "DESC"], ["id", "DESC"]],
        limit: 5,
        include: {
          model: BillSaleDetailModel,
          required: true,
          include: { model: ProductModel, attributes: PRODUCT_BRIEF },
        },
      }),
      // สต็อกคงเหลือต่อสินค้า นับแบบเดียวกับ /stock/report (รับเข้า − ทุกรายการขาย)
      q(`SELECT COUNT(*) AS "productCount",
                COALESCE(SUM(bal), 0) AS "totalStock",
                COUNT(*) FILTER (WHERE bal < 0) AS "negativeCount"
         FROM (
           SELECT COALESCE(si.q, 0) - COALESCE(so.q, 0) AS bal
           FROM products p
           LEFT JOIN (SELECT "productId", SUM(qty) AS q FROM stocks GROUP BY 1) si ON si."productId" = p.id
           LEFT JOIN (SELECT "productId", SUM(qty) AS q FROM "billSaleDetails" GROUP BY 1) so ON so."productId" = p.id
           WHERE p."userId" = :userId
         ) s`),
    ]);

    res.send({
      message: "success",
      results: {
        totalBills: Number(totals.totalBills),
        totalSales: Number(totals.totalSales),
        weekSales: week.map((w) => ({ date: w.date, total: Number(w.total) })),
        topProducts: top.map((t) => ({ name: t.name, qty: Number(t.qty) })),
        recentBills,
        stock: {
          productCount: Number(stock.productCount),
          totalStock: Number(stock.totalStock),
          negativeCount: Number(stock.negativeCount),
        },
      },
    });
  } catch (e) {
    service.sendError(res, e);
  }
});

module.exports = router;
