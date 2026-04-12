const express = require("express");
const app = express();
const BankModel = require('../models/ฺBankModel');

app.get('/bank/list', async (req, res) => {
    try {
        const results = await BankModel.findAll();
        res.send({ message: 'success', results: results});
    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message});
    }
})

module.exports = app;