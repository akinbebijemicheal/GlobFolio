/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const moment = require("moment");
const db = require("../config/config");
const sequelize = db;
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
const { has } = require("config");

exports.createSubscriptionPlan = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const existsub = await SubscriptionPlan.findOne({
        where: { name: req.body.name },
      });
      if (existsub != null) {
        return res.status(404).send({
          success: false,
          message:
            "Subscription plan with this name exists, name must be unique",
        });
      }

      const plan = await SubscriptionPlan.create(req.body, {
        include: [
          {
            model: SubscriptionPlanPackage,
            as: "benefits",
          },
        ],
        transaction: t,
      });

      return res.status(200).send({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.updateSubscriptionPlan = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { benefits, planId, ...other } = req.body;
      const plan = await SubscriptionPlan.findByPk(planId);
      await plan.update(other, { transaction: t });
      await SubscriptionPlanPackage.destroy({
        where: { planId },
      });
      await Promise.all(
        benefits.map(async (item) => {
          await SubscriptionPlanPackage.create(
            {
              benefit: item.benefit,
              planId,
            },
            { transaction: t }
          );
        })
      );

      return res.status(200).send({
        success: true,
        message: "Subscription plan updated successfully",
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.deleteSubscriptionPlan = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { planId } = req.params;
      const plan = await SubscriptionPlan.destroy({
        where: { id: planId },
        include: [
          {
            model: SubscriptionPlanPackage,
            as: "benefits",
          },
        ],
      });

      return res.status(200).send({
        success: true,
        message: "Subscription plan delete successfully",
      });
    } catch (error) {
      console.log(error);
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
          as: "benefits",
        },
      ],
    });
    return res.status(200).send({
      success: true,
      data: plans,
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
          as: "benefits",
        },
      ],
    });
    return res.status(200).send({
      success: true,
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSubUsersByPlanId = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findOne({
      where: { id: req.params.planId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: SubscriptionPlanPackage,
          as: "benefits",
        },
        {
          model: Subscription,
          as: "subscriptions",
          include: [
            {
              model: User,
              as: "subscriptionPlan",
            },
          ],
        },
      ],
    });
    return res.status(200).send({
      success: true,
      data: plans,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSubscriptionHistory = async (req, res, next) => {
  try {
    const plans = await Subscription.findAll({
      order: [["createdAt", "DESC"]],
    });
    const subscriptions = await Promise.all(
      plans.map(async (plan) => {
        let user = await User.findOne({
          where: { id: plan.userId },
        });

        plan.user = user;
        return plan;
      })
    );
    return res.status(200).send({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getUserSubscriptionHistory = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { userId: req.params.userId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    return next(error);
  }
};

exports.subscribeToPlan = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { userId, planId } = req.body;
      const plan = await SubscriptionPlan.findOne({ where: { id: planId } });
      const { duration, amount, name } = plan;

      const profile = await UserService.findUserById(userId);
      const { id } = profile;

      // get user has active sub
      const sub = await Subscription.findOne({
        where: { userId: id, status: 1 },
      });
      const now = moment();
      let remainingDays = 0;
      let amountToPay = 0;

      let amountOfMonths = Number(duration) * 12;
      let pricePerMonth = amount / amountOfMonths;
      const days = amountOfMonths * 31;

      // create subscription
      const newDate = moment(now, "DD-MM-YYYY").add(days, "days");

      // save transaction
      const description = `${user.fullname} Payment for ${plan.name}`;
      const slug = Math.floor(190000000 + Math.random() * 990000000);
      const txSlug = `GLOBFOLIO/TXN/${slug}`;
      const transaction = {
        TransactionId: txSlug,
        userId: id,
        type: "Subscription",
        amount: amountToPay,
        description,
        status: "PENDING",
      };
      await Transaction.create(transaction, { transaction: t });
      const user = await User.findByPk(userId);

      const response = {
        user: user,
        amount: amountToPay,
        newExpiryDate: newDate,
        TransactionId: txSlug,
        plan: plan,
      };

      return res.send({
        success: true,
        message: "Subscription Initiated",
        data: response,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.upgradePlan = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { userId, planId } = req.body;
      const plan = await SubscriptionPlan.findOne({ where: { id: planId } });
      const { duration, amount, name } = plan;

      const profile = await UserService.findUserById(userId);
      const { id } = profile;

      // get user has active sub
      const sub = await Subscription.findOne({
        where: { userId: id, status: 1 },
      });
      const now = moment();
      let remainingDays = 0;
      let amountToPay = 0;
      if (sub) {
        // get expiration Date and remaining days for current plan
        const { expiredAt } = sub;
        const then = moment(expiredAt);
        remainingDays = then.diff(now, "days");
        //get amount of money worth remaining for customer from current plan
        const prevSubPlan = await SubscriptionPlan.findByPk(sub.planId);
        const prevSubPlanDays = prevSubPlan.duration * 7;
        const prevSubPlanRemainingAmount = prevSubPlan.amount / prevSubPlanDays;
        amountToPay = amount - prevSubPlanRemainingAmount;
        // console.log(expiredAt, remainingDays);
        // await sub.update({ status: 0 }, { transaction: t });
      } else {
        amountToPay = amount;
      }
      const days = Number(duration) * 7;

      // create subscription
      const newDate = moment(now, "DD-MM-YYYY").add(days, "days");

      // save transaction
      const description = `${user.fullname} Payment for ${plan.name}`;
      const slug = Math.floor(190000000 + Math.random() * 990000000);
      const txSlug = `GLOBFOLIO/TXN/${slug}`;
      const transaction = {
        TransactionId: txSlug,
        userId: id,
        type: "Subscription",
        amount: amountToPay,
        description,
        status: "PENDING",
      };
      await Transaction.create(transaction, { transaction: t });
      const user = await User.findByPk(userId);

      const response = {
        user: user,
        amount: amountToPay,
        newExpiryDate: newDate,
        TransactionId: txSlug,
        plan: plan,
      };

      return res.send({
        success: true,
        message: "Subscription Initiated",
        data: response,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.verifySubscriptionUpgrade = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { userId, newExpiryDate, reference, planId, TransactionId } =
        req.body;
      const plan = await SubscriptionPlan.findOne({ where: { id: planId } });
      const { duration, amount, name } = plan;

      const response = await Service.Paystack.verifyPayment(reference);
      console.log(response);
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
      if (sub) {
        await sub.update({ status: 0 }, { transaction: t });
      }

      // create new subscription
      const request = {
        userId: id,
        planId,
        status: 1,
        expiredAt: newExpiryDate,
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

      // update transaction

      await Transaction.update(
        { status: "PAID", payment_reference: reference },
        { where: { TransactionId }, transaction: t }
      );

      const transaction = await Transaction.findOne({
        where: { TransactionId },
      });
      const user = await User.findByPk(userId);

      let orderData = {
        user: user,
        transaction: transaction,
        plan: plan,
        expiryDate: newDate,
      };

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
        message: "Subscription Payment Made Sucessfully",
        data: response,
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
      const { userId, reference, planId } = req.body;
      const plan = await SubscriptionPlan.findOne({ where: { id: planId } });
      console.log(plan)
         if (plan == null) {
           return res.status(400).json({
             success: false,
             message: "Plan doesnt exist",
           });
         }
      const { duration, amount, name } = plan;

      const response = await Service.Paystack.verifyPayment(reference);
      console.log(response);
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

      const now = moment();
      // let remainingDays = 0;
      let amountToPay = 0;

      let amountOfMonths = Number(duration) * 12;
      let pricePerMonth = amount / amountOfMonths;
      const days = amountOfMonths * 31;

      const user = await User.findByPk(userId);

      // create subscription
      const newDate = moment(now, "DD-MM-YYYY").add(days, "days");

      // create new subscription
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
      const h= await UserService.updateUser({
        userData,
        transaction: t,
      });
      console.log(h)

      // save transaction
      const description = `${user.fullname} Payment for ${plan.name}`;
      const slug = Math.floor(190000000 + Math.random() * 990000000);
      const txSlug = `GLOBFOLIO/TXN/${slug}`;
      const newtransaction = {
        TransactionId: txSlug,
        userId: id,
        type: "Subscription",
        amount: amountToPay,
        description,
        status: "approved",
      };
      const transaction = JSON.parse(
        JSON.stringify(
          await Transaction.create(newtransaction, { transaction: t })
        )
      );
      console.log(transaction);

      let orderData = {
        user: JSON.parse(JSON.stringify(user)),
        transaction: transaction,
        plan: JSON.parse(JSON.stringify(plan)),
        expiryDate: newDate,
      };

      // const invoice = await invoiceService.createInvoice(orderData, user);
      // if (invoice) {
      //   const files = [
      //     {
      //       path: `uploads/${orderData.user.fullname} Subscription.pdf`,
      //       filename: `${orderData.user.fullname} Subscription.pdf`,
      //     },
      //   ];

      // //   const message = helpers.invoiceMessage(user.fullname);
      // //   sendMail(user.email, message, "GlobFolio Subscription Invoice", files);
      // }
      const userUpdated = await User.findByPk(userId);

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
        message: "Subscription Payment Made Sucessfully",
        data: userUpdated,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.getSubUsers = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Subscription,
          as: "subscriptions",
        },
        {
          model: User,
          as: "subscriptionPlan",
        },
      ],
    });
    // for(let i = 0; i < plans.length; i++){

    // }

    return res.status(200).send({
      success: true,
      message: "subusers",
      data: plans,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSubUsersCount = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: SubscriptionPlanPackage,
          as: "benefits",
        },
      ],
    });
    return res.status(200).send({
      success: true,
      data: plans,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSubUsersByPlanId = async (req, res, next) => {
  try {
    const planId = req.params.planId;
    const plans = await SubscriptionPlan.findOne({
      where: { id: planId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: SubscriptionPlanPackage,
          as: "benefits",
        },
      ],
    });
    return res.status(200).send({
      success: true,
      data: plans,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getPlanByName = async (req, res, next) => {
  try {
    const name = req.query.name;
    const plan = await SubscriptionPlan.findOne({
      where: { name },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: SubscriptionPlanPackage,
          as: "benefits",
        },
      ],
    });
    return res.status(200).send({
      success: true,
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};
