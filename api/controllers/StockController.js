const express = require("express");
const router = express.Router();
const Service = require("./Service");
const StockModel = require('../models/StockModel');
const ProductModel = require('../models/ProductModel');
const BillSaleDetailModel = require('../models/BillSaleDetailModel');

router.post('/stock/save', Service.isMember, async (req, res  ) => {
    try {
        const qty = Service.toPositiveInt(req.body.qty);
        if (!qty) {
            return res.status(400).send({ message: 'จำนวนไม่ถูกต้อง' });
        }
        const product = await ProductModel.findOne({
            where: { id: req.body.productId, userId: Service.getMemberId(req) },
            attributes: ['id']
        });
        if (!product) {
            return res.status(404).send({ message: 'ไม่พบสินค้า' });
        }

        let payload = {
            qty: qty,
            productId: req.body.productId,
            userId: Service.getMemberId(req)
        }

        delete payload.id;

        await StockModel.create(payload)

        res.send({ message: 'success'});
    } catch (e) {
        Service.sendError(res, e);
    }
})

router.get('/stock/list', Service.isMember, async (req, res) => {
    try {

        const results = await StockModel.findAll({
            where: {
                userId: Service.getMemberId(req)
            },
            order: [['id', 'DESC']],
            include: {
                model: ProductModel
            }
        })

        res.send({ message: 'success', results: results})
    } catch (e) {
        Service.sendError(res, e);
    }
})

router.delete('/stock/delete/:id', Service.isMember, async (req, res) => {
    try {
        await StockModel.destroy({
            where: {
                userId: Service.getMemberId(req),
                id: req.params.id
            }
        })

        res.send({message: 'success'});
    } catch (e) {
        Service.sendError(res, e);
    }
})

router.get('/stock/report', Service.isMember, async (req, res) => {
    try {

        let arr = [];

        // separate: true = ดึง stocks และ billSaleDetails เป็น query แยก
        // (เดิม JOIN 2 hasMany พร้อมกันทำให้แถวคูณกัน stocks × billSaleDetails ต่อสินค้า)
        const results = await ProductModel.findAll({
            include: [
                {
                    model: StockModel,
                    separate: true,
                    include: {
                        model: ProductModel
                    }
                },
                {
                    model: BillSaleDetailModel,
                    separate: true,
                    include: {
                        model: ProductModel
                    }
                }
            ],
            where: {
                userId: Service.getMemberId(req)
            }
        })

        for (let i = 0; i < results.length; i++) {
            const result = results[i]; 
            const stocks = result.stocks;
            const billSaleDetails = result.billSaleDetails;

            let stockIn = 0;
            let stockOut = 0;

            for (let j = 0; j < stocks.length; j++) {
                const item = stocks[j];
                stockIn += parseInt(item.qty);
            }

            for (let j = 0; j < billSaleDetails.length; j++) {
                const item = billSaleDetails[j];
                stockOut += parseInt(item.qty);
            }

            arr.push({
                result: result,
                stockIn: stockIn,
                stockOut: stockOut
            })

            
        }
        res.send({message: 'success' , results: arr});
    } catch (e) {
        Service.sendError(res, e);
    } 
}) 

module.exports = router;