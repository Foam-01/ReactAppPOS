const express = require("express");
const MemberModel = require("../models/MemberModel");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const service = require ('./Service')
const PackageModal = require('../models/PackageModel')

app.post("/member/signin", async (req, res) => {
  try {
    const member = await MemberModel.findAll({
      where: {
        phone: req.body.phone,
        pass: req.body.pass,
      },
    });

    if (member.length > 0) {
      let token = jwt.sign({ id: member[0].id }, process.env.secret);
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

app.get('/member/info', service.isLogin, async (req, res, next) => {
    try {
        MemberModel.belongsTo(PackageModal);
        
        const payload = jwt.decode(service.getToken(req));
        const member = await MemberModel.findByPk(payload.id, {
            attributes: ['id' , 'name'],
            include: [
                {
                    model: PackageModal,
                    attributes: ['name' , 'bill_amount']    
                }
            ]
        })
            
        res.send({result: member, message: 'success'});
        
    } catch (e) {
        res.statusCode = 500;
        return res.send({message: e.message});
    }
})

app.put('/member/changeProfile', service.isLogin, async (req, res) => {
    try {
        
        const memberId = service.getMemberId(req);
        const paylond = {
            name: req.body.memberName
        }
        const result = await MemberModel.update(paylond,{
            where: {
                id: memberId
            }
        });

        res.send({ message: 'success', result: result});
    } catch (e) {
        res.statusCode = 500;
        return res.send({message: e.message})
    }
})

app.get('/member/list', service.isLogin, async (req, res) => {
    try {
        const PackageMoael = require('../models/PackageModel');
        MemberModel.belongsTo(PackageMoael);
        const results = await MemberModel.findAll({
            order: [['id', 'DESC']],
            attributes: ['id', 'name', 'phone', 'createdAt'],
            include: {
                model: PackageMoael,
            }
        })
        res.send ({ message: 'success', results: results})
    } catch (e) {
        res.statusCode = 500;
        return res.send ({ message: e.message })
    }
})

module.exports = app;
