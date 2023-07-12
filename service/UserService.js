require("dotenv").config();
const axios = require("axios");
const User = require("../model/user");
const Referral = require("../model/Referral");
// const BankDetail = require("../model/BankDetail");


exports.findUser = async (where) => {
  const user = await User.findOne({ where });
  return user;
};

exports.getUserDetails = async (where) => {
  const user = await User.findOne({
    where,
    attributes: {
      exclude: ["password", "createdAt", "updatedAt", "deletedAt"],
    },
  });
  return user;
};

exports.getAllUsers = async (where) => {
  const user = await User.findAll({
    where,
    attributes: {
      exclude: ["password", "deletedAt"],
    },
    order: [["createdAt", "DESC"]],
  });
  return user;
};

exports.findUserDetail = async (where) => {
  const user = await User.findOne({
    where,
    attributes: {
      exclude: ["password", "deletedAt"],
    },
  });
  return user;
};

exports.findUserById = async (id) => {
  const user = await User.findByPk(id);
  return user;
};

exports.createNewUser = async (userData, transaction) => {
  const user = await User.create(userData, { transaction });
  return user;
};

exports.updateUser = async (userData, transaction) => {
  await User.update(userData, {
    where: { id: userData.id },
    transaction,
  });
  return true;
};

exports.createProfile = async (userData, transaction) => {
  const profile = await Profile.create(userData, { transaction });
  return profile;
};

exports.updateUserProfile = async (userData, where, transaction) => {
  await Profile.update(userData, {
    where,
    transaction,
  });
  return true;
};

exports.getProfile = async (where) => {
  const profile = await Profile.findOne({ where });
  return profile;
};

exports.createBankDetails = async (data, transaction) => {
  const bank = await BankDetail.create(data, { transaction });
  return bank;
};

exports.updateBankDetails = async (data, transaction) => {
  await BankDetail.update(data, {
    where: { id: data.id },
    transaction,
  });
  return true;
};

exports.deleteBankDetails = async (data, transaction) => {
  await BankDetail.update(data, {
    where: { id: data.id },
    transaction,
  });
  return true;
};

exports.getBankDetails = async (where) => {
  const bank = await BankDetail.findOne({ where });
  return bank;
};

exports.validateUserType = (type) => {
  const userType = [
    "user",
    "admin",
    "none",
  ];
  if (!userType.includes(type)) {
    return false;
  }
  return true;
};

exports.createReferral = async (data, transaction) => {
  const reference = await Referral.create(data, { transaction });
  return reference;
};

exports.updateReferral = async (data, transaction) => {
  await Referral.update(data, {
    where: { id: data.id },
    transaction,
  });
  return true;
};

exports.deleteReferral = async (data, transaction) => {
  await Referral.update(data, {
    where: { id: data.id },
    transaction,
  });
  return true;
};

exports.findReferral = async (where) => {
  const referral = await Referral.findOne({ where });
  return referral;
};

exports.getReferrals = async (where) => {
  const referrals = await Referral.findAll({ where });
  return referrals;
};

exports.validateCaptcha = async (captcha) => {
  try {
    // req.connection.remoteAddress
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA_SECRET}&response=${captcha}`;
    const response = await axios.post(url);
    if (!response.data.success || response.data.success !== true) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

exports.getUserType = (type) => {
  switch (type) {
    case "admin":
      return "admin";
    case "Admin":
    case "user":
      return "User";
    default:
      return "";
  }
};

// exports.getUserTypeProfile = async (userType, userId) => {
//   try {
//     const attributes = {
//       exclude: ["createdAt", "updatedAt", "deletedAt"],
//     };
//     let profile = null;
//     if (userType === "professional" || userType === "service_partner") {
//       profile = JSON.parse(
//         JSON.stringify(
//           await ServicePartner.findOne({
//             include: [{ model: ServiceType, as: "service_category" }],
//             where: { userId },
//             attributes,
//           })
//         )
//       );
//     } else if (userType === "vendor" || userType === "product_partner") {
//       profile = JSON.parse(
//         JSON.stringify(
//           await ProductPartner.findOne({ where: { userId }, attributes })
//         )
//       );
//     } else if (userType === "private_client") {
//       profile = JSON.parse(
//         JSON.stringify(
//           await PrivateClient.findOne({ where: { userId }, attributes })
//         )
//       );
//     } else if (userType === "corporate_client") {
//       profile = JSON.parse(
//         JSON.stringify(
//           await CorporateClient.findOne({ where: { userId }, attributes })
//         )
//       );
//     }
//     return profile;
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.updateUserTypeProfile = async ({ userType, id, data, transaction }) => {
//   if (userType === "professional" || userType === "service_partner") {
//     await ServicePartner.update(data, { where: { id }, transaction });
//   } else if (userType === "vendor" || userType === "product_partner") {
//     await ProductPartner.update(data, { where: { id }, transaction });
//   } else if (userType === "private_client") {
//     await PrivateClient.update(data, { where: { id }, transaction });
//   } else if (userType === "corporate_client") {
//     await CorporateClient.update(data, { where: { id }, transaction });
//   }
//   return true;
// };

// exports.getUserFromProfile = async (userType, id) => {
//   const attributes = {
//     exclude: ["createdAt", "updatedAt", "deletedAt"],
//   };
//   let profile;
//   if (userType === "professional" || userType === "service_partner") {
//     profile = JSON.parse(
//       JSON.stringify(
//         await ServicePartner.findOne({
//           where: { id },
//           attributes,
//           include: [
//             {
//               model: ServiceType,
//               as: "service_category",
//             },
//           ],
//         })
//       )
//     );
//   } else if (userType === "vendor" || userType === "product_partner") {
//     profile = JSON.parse(
//       JSON.stringify(
//         await ProductPartner.findOne({ where: { id }, attributes })
//       )
//     );
//   } else if (userType === "private_client") {
//     profile = JSON.parse(
//       JSON.stringify(await PrivateClient.findOne({ where: { id }, attributes }))
//     );
//   } else if (userType === "corporate_client") {
//     profile = JSON.parse(
//       JSON.stringify(
//         await CorporateClient.findOne({ where: { id }, attributes })
//       )
//     );
//   }
//   const user = JSON.parse(JSON.stringify(await User.findByPk(profile.userId)));
//   user.profile = profile;
//   return user;
// };
