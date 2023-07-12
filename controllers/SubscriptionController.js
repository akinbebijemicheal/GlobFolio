/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const moment = require("moment");
const db = require("../config/config");
const sequelize = db
// const Testimony = require("../models/Testimonies");
const User = require("../model/user");
const Notification = require("../helpers/notification");
const SubscriptionPlan = require("../model/SubscriptionPlan");
const SubscriptionPlanPackage = require("../model/SubscriptionPlanPackage");
const Subscription = require("../model/Subscription");
const Payment = require("../model/Payment");
const Transaction = require("../model/Transaction");
const UserService = require("../service/UserService");
const { Service } = require("../helpers/paystack");
const invoiceService = require("../service/invoiceService2");
const helpers = require("../helpers/message");
const { sendMail } = require("../service/attachmentEmailService");



exports.createSubscriptionPlan = async (req, res, next) => {
  sequelize.transaction(async t => {
    try {
      const plan = await SubscriptionPlan.create(req.body, {
        include: [
          {
            model: SubscriptionPlanPackage,
            as: "benefits"
          }
        ],
        transaction: t
      });

      return res.status(200).send({
        success: true,
        data: plan
      });
    } catch (error) {
      t.rollback();
      return next(error);
    }
  });
};

exports.updateSubscriptionPlan = async (req, res, next) => {
  sequelize.transaction(async t => {
    try {
      const { benefits, planId, ...other } = req.body;
      const plan = await SubscriptionPlan.findByPk(planId);
      await plan.update(other, { transaction: t });
      await Promise.all(
        benefits.map(async item => {
          const benefit = await SubscriptionPlanPackage.findByPk(item.id);
          if (benefit) {
            await benefit.update({ benefit: item.benefit }, { transaction: t });
          } else {
            await SubscriptionPlanPackage.create(
              {
                benefit: item.benefit,
                planId
              },
              { transaction: t }
            );
          }
        })
      );

      return res.status(200).send({
        success: true,
        message: "Subscription plan updated successfully"
      });
    } catch (error) {
      t.rollback();
      return next(error);
    }
  });
};

exports.deleteSubscriptionPlan = async (req, res, next) => {
  sequelize.transaction(async t => {
    try {
      const { planId } = req.params;
      const plan = await SubscriptionPlan.destroy({
        where: { id: planId },
        include: [
          {
            model: SubscriptionPlanPackage,
            as: "benefits"
          }
        ]
      });

      return res.status(200).send({
        success: true,
        message: "Subscription plan delete successfully"
      });
    } catch (error) {
      t.rollback();
      return next(error);
    }
  });
};

exports.getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: SubscriptionPlanPackage,
          as: "benefits"
        }
      ]
    });
    return res.status(200).send({
      success: true,
      data: plans
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSingleSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findOne({
      where: { id: req.params.planId },
      include: [
        {
          model: SubscriptionPlanPackage,
          as: "benefits"
        }
      ]
    });
    return res.status(200).send({
      success: true,
      data: plan
    });
  } catch (error) {
    return next(error);
  }
};

exports.subscribeToPlan = async (req, res, next) => {
  sequelize.transaction(async t => {
    try {
      const { userId, reference, planId, userType } = req.body;
      const plan = await SubscriptionPlan.findOne({ where: { id: planId } });
      const { duration, amount, name } = plan;
      const profile = await UserService.findUserById(userId);
      const { id } = profile;
      // safe payment made for reference
      const paymentData = {
        userId: id,
        payment_reference: reference,
        amount,
        payment_category: "Subscription"
      };

      await Payment.create(paymentData, { transaction: t });
     



      return res.send({
        success: true,
        planDetails: plan,
        user: profile,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};


exports.verifySubscription = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { userId, reference, planId, } = req.body;
      const plan = await SubscriptionPlan.findOne({ where: { id: planId } });
      const { duration, amount, name } = plan;

           const response = await Service.Paystack.verifyPayment(
             reference
           );
           console.log(response)
           if (response.status === false) {
             return res.status(400).json({
               success: false,
               message: response.message || "Transaction reference not valid",
             });
           }
      
      const profile = await UserService.findUserById(userId);
      const { id } = profile;
      // safe payment made for reference
      const paymentData = {
        userId: id,
        payment_reference: reference,
        amount,
        payment_category: "Subscription",
      };

      await Payment.create(paymentData, { transaction: t });
      // get user has active sub
      const sub = await Subscription.findOne({
        where: { userId: id, status: 1 },
      });
      const now = moment();
      let remainingDays = 0;
      if (sub) {
        // get expiration Date
        const { expiredAt } = sub;
        const then = moment(expiredAt);
        remainingDays = then.diff(now, "days");
        // console.log(expiredAt, remainingDays);
        await sub.update({ status: 0 }, { transaction: t });
      }
      const days = Number(duration) * 7 + remainingDays;

      // create subscription
      const newDate = moment(now, "DD-MM-YYYY").add(days, "days");
      const request = {
        userId: id,
        planId,
        status: 1,
        expiredAt: newDate,
        amount,
      };
      await Subscription.create(request, { transaction: t });
      // update user profile
      const userData = {
        id: id,
        planId,
        hasActiveSubscription: true,
        expiredAt: newDate,
      };
      await UserService.updateUser({
        userData,
        transaction: t,
      });

      // save transaction
      const description = `Made Payment for ${plan.name}`;
      const slug = Math.floor(190000000 + Math.random() * 990000000);
      const txSlug = `BOG/TXN/${slug}`;
      const transaction = {
        TransactionId: txSlug,
        userId: id,
        type: "Subscription",
        amount,
        description,
        paymentReference: reference,
        status: "PAID",
      };
      await Transaction.create(transaction, { transaction: t });
      const user = await User.findByPk(userId);

      let orderData = {
        "user": user,
        "transaction": transaction,
        "plan": plan,
        "expiryDate": newDate

      }

            const invoice = await invoiceService.createInvoice(orderData, user);
      if (invoice) {
        const files = [
          {
            path: `uploads/${orderData.user.fullname} Subscription.pdf`,
            filename: `${orderData.user.fullname} Subscription.pdf`,
          },
        ];
        const message = helpers.invoiceMessage(user.fullname);
        sendMail(user.email, message, "GlobFolio Subscription Invoice", files);
      }
      // Notify admin
      const mesg = `${
        user.name ? user.name : `${user.fullname}`
      } just subscribed to ${name} with their ${UserService.getUserType(
        user.userType
      )} account`;
      const notifyType = "admin";
      const { io } = req.app;
      await Notification.createNotification({
        type: notifyType,
        message: mesg,
        userId: id,
      });
      io.emit("getNotifications", await Notification.fetchAdminNotification());

      return res.send({
        success: true,
        message: "Subscription Made Sucessfully",
        data: response
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.getSubscriptionHistory = async (req, res, next) => {
  try {
    const plans = await Subscription.findAll({
      order: [["createdAt", "DESC"]]
    });
    const subscriptions = await Promise.all(
      plans.map(async plan => {
        let user = await User.findOne({
          where: { id: plan.userId }
        });
      
        plan.user = user;
        return plan;
      })
    );
    return res.status(200).send({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    return next(error);
  }
};

exports.getUserSubscriptionHistory = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { userId: req.params.userId },
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).send({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    return next(error);
  }
};
