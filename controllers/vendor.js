const User = require("../model/user");
const Subscription = require("../model/Subscription");
require("dotenv").config();

exports.getUnverifieds = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        role: "vendor",
        verified: false,
      },
    });

    return res.status(200).json({
      success: false,
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};
exports.verification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user && user.role === "vendor") {
      await User.update(
        { verified: true },
        {
          where: {
            email: email,
          },
        }
      );
      await Subscription.findOne({
        where: {
          userId: req.user.id,
        },
      }).then(async (vendorsub) => {
        if (!vendorsub) {
          var somedate = new Date();
          somedate.setDate(somedate.getDate() + 7);
          const sub = new Subscription({
            userId: user.id,
            sub_type: "free",
            status: "active",
            expire_date: `${somedate}`,
          });
          var savedsub = await sub.save();
        }
      });

      res.status(200).json({
        success: true,
        message: "Vendor verified!",
      });
    } else {
      res.status(301).json({
        success: false,
        message: "Vendor already verified!",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};

exports.getVendors = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: "vendor" } });
    if (users) {
      return res.status(200).json({
        success: true,
        data: users,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};

exports.getVendorsByServices = async (req, res) => {
  const { serviceType } = req.body;
  try {
    const users = await User.findAll({
      where: {
        role: "vendor",
        serviceType: serviceType,
      },
    });
    if (users) {
      return res.status(200).json({
        success: true,
        data: users,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};
