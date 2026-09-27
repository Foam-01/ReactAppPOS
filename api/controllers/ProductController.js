const express = require("express");
const router = express.Router();
const ProductModel = require('../models/ProductModel');
const ProductImageModel = require('../models/ProductImageModel');
const Service = require('./Service');

const PRODUCT_FIELDS = ['barcode', 'name', 'cost', 'price', 'detail'];

router.post('/product/insert', Service.isMember, async (req, res) => {
    try {
        const payload = Service.pick(req.body, PRODUCT_FIELDS);
        payload.userId = Service.getMemberId(req)
        const result =  await  ProductModel.create(payload);
        res.send({ result: result, message: 'success'})
    } catch (e) {
        Service.sendError(res, e);
    }
})

router.get('/product/list', Service.isMember, async (req, res) => {
    try {
        const results = await ProductModel.findAll({
            where: {
                userId: Service.getMemberId(req)
            },
            order: [['id', 'DESC']]
        })
        res.send({results: results, message: 'success'})
    } catch (e) {
        Service.sendError(res, e);
    }
})

router.delete('/product/delete/:id', Service.isMember, async (req, res) => {
    try {
        const result = await ProductModel.destroy({
            where: {
                id: req.params.id,
                userId: Service.getMemberId(req)
            }
        })
        res.send({message: 'success', result: result});
    }catch (e) {
        Service.sendError(res, e);
    }
})

router.post('/product/update', Service.isMember, async (req, res) => {
    try {
        const payload = Service.pick(req.body, PRODUCT_FIELDS);
         const result = await ProductModel.update(payload, {
            where: {
                id: req.body.id,
                userId: Service.getMemberId(req)
            }
         })
         res.send({message: 'success', result: result});
    }catch (e) {
        Service.sendError(res, e);
    }
})

router.get('/product/listForSale', Service.isMember, async (req, res) => {
    try {
        const results = await ProductModel.findAll({
            where: {
                userId: Service.getMemberId(req)
            },
            order: [["id", "DESC"]],
            include: {
                model: ProductImageModel,
                where: {
                    isMain: true
                },
                required: false
            }
        })

        res.send({message: 'success', results: results});
    } catch (e) {
        Service.sendError(res, e);
    }
})

module.exports = router;
