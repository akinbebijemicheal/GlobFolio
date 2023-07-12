const express = require("express");
const router = express.Router();
const multer = require("../util/multer2");
const Access = require("../middleware/access");
const SubscriptionController = require("../controllers/SubscriptionController");
const TopGainerController = require("../controllers/TopGainerController");
const StockAdvisoryController = require("../controllers/StockAdvisoryController");
const upload = require("../helpers/upload");

const PaystackController = require("../controllers/PaystackController");

const { validate, bankValidation } = require("../helpers/validators");


const {
  profile,
  RegisterUser,
  LoginUser,
  checkRole,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  userAuth,
  facebookSignup,
  appleSign,
  googleSignin,
  googleSign,
  verifyUserEmail,
  loginAdmin,
  getUserById,
  getAdminById,
  deleteUserByAdmin,
} = require("../controllers/user");
const {
  checkEmail,
  changePassword,
  forgotPassword,
  emailVerification_V1,
  emailVerification_V2,
  resetPassword,
  resetUserPassword,
} = require("../controllers/security");
const {
  verification,
  getUnverifieds,
  getVendors,
  getVendorsByServices,
} = require("../controllers/vendor");
const {
  updatePicture,
  uploadPicture,
  deletePicture,
  getPicture,
} = require("../controllers/picture");
const jwtAuth = require("../middleware/jwtAuth");

const userVerify = require("../middleware/verify");

const { support, getSupportMessages } = require("../controllers/support");
const passport = require("passport");
const { createFeedback, getAllFeedbacks } = require("../controllers/feedback");
//user
router.post("/register-user", async (req, res, next) => {
  await RegisterUser(req, res, next);
});

router.post("/signin-user", async (req, res, next) => {
  await LoginUser(req, res, next);
});

router.post("/signin-admin", async (req, res, next) => {
  await loginAdmin(req, res, next);
});

/**
 * Facebook signin * signup
 */
router.route("/facebook/login").post(
  passport.authenticate("facebook", { session: false })
  // UserController.testfblogin
);
router.route("/auth/facebook-signup").post(
  // facebookSignupValidation(),
  //  validate,
  [Access.authenticateFBSignup],
  facebookSignup
);
// router.route("/user/auth/facebook-signin").post([facebookLoginValidation(), validate], [Access.authenticateFBSignin], UserController.facebookSignin);

/**
 * Apple signin and signup
 */
router.route("/auth/apple").post(
  // [appleSignValidation(), validate],
  Access.authenticateAppleSignin,
  appleSign
);

/**
 * Google signin and signup
 */
router.route("/auth/google").post(
  // [googleSignValidation(), validate],
  Access.authenticateGoogleSignin,
  googleSign
);

router.route("/auth/google-signin").post(
  // [googleLoginValidation(), validate],
  googleSignin
);

router.route("/dashboard/profile").get(jwtAuth, async (req, res) => {
  return res.json(profile(req.user));
});

router.route("/dashboard/update-account").patch(jwtAuth, updateUser);

router
  .route("/dashboard/profile/upload-pic")
  .post(jwtAuth, multer.single("image"), uploadPicture);

router
  .route("/dashboard/profile/update-pic")
  .post(jwtAuth, multer.single("image"), updatePicture);

router.route("/dashboard/profile/delete-pic").delete(jwtAuth, deletePicture);

router.route("/dashboard/profile/get-pic/").get(jwtAuth, getPicture);

router.route("/verification").post(jwtAuth, checkRole(["admin"]), verification);

// router.route("/email-verification").post(jwtAuth, emailVerification_V1);

// router.route("/email-verification").get(emailVerification_V2);

// router.route("/reset-password").post(checkEmail);

// router.route("/reset-password/:id/:token").get(forgotPassword);

router.route("/change-password").patch(jwtAuth, changePassword);

router.route("/verifyemail").get(verifyUserEmail);

router.route("/forgot-password").get(forgotPassword);

router.route("/reset-password").post(resetPassword);

router
  .route("/admin/reset-password/:id")
  .put(jwtAuth, checkRole(["admin"]), resetUserPassword);




//-----------------------------Support--------------------------------
router.post("/support", support);
router.post(
  "/admin/getSupportMesssages",
  jwtAuth,
  checkRole(["admin"]),
  getSupportMessages
);




//-----------------------------Feedback--------------------------------
router.post("/dashboard/createFeedback", jwtAuth, createFeedback);
router.get(
  "/admin/getFeedbacks",
  jwtAuth,
  checkRole(["admin"]),
  getAllFeedbacks
);




//-----------------------------Admin User Manage--------------------------------
router.get(
  "/admin/getUser/:userId",
  jwtAuth,
  checkRole(["admin"]),
  getUserById
);
router.get(
  "/admin/getAdmin/:userId",
  jwtAuth,
  checkRole(["admin"]),
  getAdminById
);
// router.post("/admin/getUserByName", jwtAuth, getUser);
router.get("/admin/getAllUsers", jwtAuth, checkRole(["admin"]), getUsers);
router.delete(
  "/admin/deleteUser/:userId",
  jwtAuth,
  checkRole(["admin"]),
  deleteUserByAdmin
);



//-----------------------------Subscription--------------------------------

const {
  subscriptionRequestValidation,
  subscribeRequestValidation,
} = require("../helpers/validators");

router
  .route("/subscription/create")
  .post(
    jwtAuth,
    checkRole(["admin"]),
    subscriptionRequestValidation(),
    validate,
    SubscriptionController.createSubscriptionPlan
  );

router
  .route("/subscription/plans")
  .get(SubscriptionController.getSubscriptionPlans);

router
  .route("/subscription/plans/:planId")
  .get(SubscriptionController.getSingleSubscriptionPlan);

router
  .route("/subscription/history")
  .get(
    jwtAuth,
    checkRole(["admin"]),
    SubscriptionController.getSubscriptionHistory
  );

router
  .route("/subscription/user-history/:userId")
  .get(jwtAuth, SubscriptionController.getUserSubscriptionHistory);

router
  .route("/subscription/update")
  .patch(SubscriptionController.updateSubscriptionPlan);

router
  .route("/subscription/delete/:planId")
  .delete(
    jwtAuth,
    checkRole(["admin"]),
    SubscriptionController.deleteSubscriptionPlan
  );

router
  .route("/subscription/subscribe")
  .post(
    subscribeRequestValidation(),
    validate,
    jwtAuth,
    SubscriptionController.subscribeToPlan
  );

  router
    .route("/subscription/verifySubscription")
    .post(
      jwtAuth,
      SubscriptionController.verifySubscription
    );


//-----------------------------Paystack Bank--------------------------------

router.route("/bank/allbanks").get(PaystackController.getBanks);

router.route("/bank/get-bank").get(jwtAuth, PaystackController.getBankDetail);

router
  .route("/bank/verify-account")
  .post(jwtAuth, PaystackController.verifyAccount);

router
  .route("/bank/save-bank")
  .post(bankValidation(), validate, jwtAuth, PaystackController.saveBankDetail);




//-----------------------------Top Gainers--------------------------------

// const {
//   subscriptionRequestValidation,
//   subscribeRequestValidation,
// } = require("../helpers/validators");

router.route("/topGainer/create").post(
  // topGainerRequestValidation(),
  jwtAuth,
  checkRole(["admin"]),
  validate,
  TopGainerController.createTopGainer
);

router
  .route("/topGainer/topGainers")
  .get(jwtAuth, TopGainerController.getTopGainers);

router
  .route("/topGainer/topGainers/:topGainerId")
  .get(jwtAuth, TopGainerController.getSingleTopGainer);


router
  .route("/topGainer/update")
  .patch(jwtAuth, checkRole(["admin"]), TopGainerController.updateTopGainer);

router
  .route("/topGainer/delete/:topGainerId")
  .delete(jwtAuth, checkRole(["admin"]), TopGainerController.deleteTopGainer);




//-----------------------------Stock Advisory--------------------------------

// const {
//   subscriptionRequestValidation,
//   subscribeRequestValidation,
// } = require("../helpers/validators");

router.route("/stockAdvisory/create").post(
  // stockAdvisoryRequestValidation(),
  jwtAuth,
  checkRole(["admin"]),
  validate,
  upload.any(),
  TopGainerController.createTopGainer
);

router
  .route("/stockAdvisory/stockAdvisorys")
  .get(jwtAuth, TopGainerController.getTopGainers);

router
  .route("/stockAdvisory/stockAdvisorys/:stockAdvisoryId")
  .get(jwtAuth, TopGainerController.getSingleTopGainer);

router
  .route("/stockAdvisory/update")
  .patch(jwtAuth, checkRole(["admin"]), upload.any(), TopGainerController.updateTopGainer);

router
  .route("/stockAdvisory/delete/:stockAdvisoryId")
  .delete(jwtAuth, checkRole(["admin"]), TopGainerController.deleteTopGainer);






module.exports = router;
