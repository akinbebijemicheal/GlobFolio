/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const { Op } = require("sequelize");
const axios = require("axios");
const db = require('../config/config');
const sequelize = db
const config = require("../helpers/config");
const { Service } = require("../helpers/paystack");
// const BankDetail = require("../models/BankDetail");

const { PAYSTACK_BASEURL } = process.env;

exports.getBanks = async (req, res, next) => {
  try {
    const response = await axios.get(`${PAYSTACK_BASEURL}/bank`, {
      headers: config.header
    });
    if (response.status) {
      return res.status(200).json({
        success: true,
        message: response.data.message,
        data: response.data.data
      });
    }
    return res.status(500).json({
      success: false,
      message: "Something went wrong!"
    });
  } catch (error) {
    return next(error);
  }
};

exports.saveBankDetail = async (req, res, next) => {
  sequelize.transaction(async t => {
    try {
      const { bank_name, account_number, account_name, bank_code } = req.body;
      const userId = req.user.id;
      const response = await Service.Paystack.verifyAccountNumber(
        account_number,
        bank_code
      );
      if (response.status === false) {
        return res.status(400).json({
          success: false,
          message: response.message || "Bank Account not valid"
        });
      }
      const data = {
        userId,
        bank_code,
        bank_name,
        account_name,
        account_number
      };
      const bankData = await BankDetail.findOne({ where: { userId } });
      if (bankData) {
        await BankDetail.update(data, { where: { userId }, transaction: t });
      } else {
        await BankDetail.create(data, { transaction: t });
      }
      return res.status(201).send({
        success: true,
        message: "Bank Detail saved successfully"
      });
    } catch (error) {
      t.rollback(next);
      return next(error);
    }
  });
};

exports.getBankDetail = async (req, res, next) => {
  sequelize.transaction(async t => {
    try {
      const userId = req.user.id;

      const bankData = await BankDetail.findOne({ where: { userId } });
      if (!bankData) {
        return res.status(400).send({
          success: false,
          data: null,
          message: "No bank saved for this user"
        });
      }
      return res.status(201).send({
        success: true,
        data: bankData
      });
    } catch (error) {
      t.rollback(next);
      return next(error);
    }
  });
};

exports.verifyAccount = async (req, res, next) => {
  // sequelize.transaction(async t => {
    try {
      const userId = req.user.id;
      const {account_number, bank_code} = req.body;

      const headers = {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
      }
      const response = await axios.get(`${process.env.PAYSTACK_BASEURL}/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {headers});

      // console.log(response)
      return res.json(response.data);

    } catch (error) {
      // t.rollback(next);
      // console.log(error)
      return next(error.response.data);
    }
  // });
};