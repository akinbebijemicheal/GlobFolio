const express = require("express");
const router = express.Router();
const multer = require("../util/multer2");
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
} = require("../controllers/user");
const {
  checkEmail,
  changePassword,
  forgotPassword,
  emailVerification_V1,
  emailVerification_V2,
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
const {
  getCinemaServices,
  getCinemaByTitle,
  getCinemaForUser,
  getCinemaById,
  getCinemaAppServices,
} = require("../controllers/services/cinema");
const {
  getFoodByTitle,
  getFoodForUser,
  getFoodServices,
  getFoodById,
  getFoodAppServices,
} = require("../controllers/services/food");
const {
  getHotelByTitle,
  getHotelForUser,
  getHotelServices,
  getHotelById,
  getHotelAppServices,
} = require("../controllers/services/hotel");
const {
  getRentByTitle,
  getRentForUser,
  getRentServices,
  getRentById,
  getRentAppServices,
} = require("../controllers/services/renting");
const {
  getStudioByTitle,
  getStudioForUser,
  getStudioServices,
  getStudioById,
  getStudioAppServices,
} = require("../controllers/services/studio_book");
const {
  getGamingByTitle,
  getGamingForUser,
  getGamingServices,
  getGameById,
  getGamingAppServices,
} = require("../controllers/services/vr_gaming");
const userVerify = require("../middleware/verify");
const {
  bookHotel,
  hotelverify,
  getUserbookings,
  getbooking,
  getAppbooking,
} = require("../controllers/Hotelbookings");
const { getRestuarant, getRestuarants } = require("../controllers/restuarant");
const { getAllAds, getAdById, getAppAllAds } = require("../controllers/ads");
const {
  AddCart,
  viewCart,
  DeleteCartItem,
  addQty,
  substractQty,
  createOrder,
  viewOrder,
  updateOrderStatus,
  viewOrders,
  buyFood,
  viewAppOrder,
} = require("../controllers/food_cart");
const {
  bookRent,
  getUserRentbookings,
  getRentbooking,
  getAppRentbooking,
} = require("../controllers/rentbooking");
const {
  bookStudio,
  getUserStudiobookings,
  getStudiobooking,
  getAppStudiobooking,
} = require("../controllers/studiobooking");
const {
  bookCinema,
  getUserCinemabookings,
  getCinemabooking,
  getAppCinemabooking,
} = require("../controllers/cinemabooking");
const {
  bookGame,
  getUserGamebookings,
  getGamebooking,
  getAppGamebooking,
} = require("../controllers/gamebooking");

const { support } = require("../controllers/support");
const {
  addCinemaReview,
  getAllCinemaReviews,
  getCinemaReviews,
  getUserCinemaReview,
  getUserCinemaReviews,
  deleteCinemaReview,
} = require("../controllers/review_cinema");
const { addFoodReview, getFoodReviews, getUserFoodReviews, getUserFoodReview, getAllFoodReviews, deleteFoodReview } = require("../controllers/review_food");
const { addGameReview, getGameReviews, getUserGameReviews, getUserGameReview, getAllGameReviews, deleteGameReview } = require("../controllers/review_game");
const { addStudioReview, getStudioReviews, getUserStudioReviews, getUserStudioReview, getAllStudioReviews, deleteStudioReview } = require("../controllers/review_studio");
const { addRentReview, getRentReviews, getUserRentReviews, getUserRentReview, getAllRentReviews, deleteRentReview } = require("../controllers/review_rent");
const { addHotelReview, getHotelReviews, getUserHotelReviews, getUserHotelReview, getAllHotelReviews, deleteHotelReview } = require("../controllers/review_hotel");

//user
router.post("/register-user", async (req, res, next) => {
  await RegisterUser(req, res, next);
});

router.post("/signin-user", async (req, res, next) => {
  await LoginUser(req, res, next);
});

//vendor
// router
// .post('/register-vendor', async (req, res) => {
//     await RegisterUser("vendor", req, res)
// });

// router
// .post('/signin-vendor', async (req, res) => {
//     await LoginUser("vendor", req, res);
// });

//admin
// router
// .post('/register-admin', async (req, res) => {
//     await RegisterUser("admin", req, res)
// });

// router
// .post('/signin-admin', async (req, res) => {
//     await LoginUser("admin", req, res);
// });

router.route("/dashboard/profile").get(jwtAuth, async (req, res) => {
  return res.json(profile(req.user));
});

router.route("/dashboard/profile/update").post(jwtAuth, updateUser);

router
  .route("/dashboard/profile/upload-pic")
  .post(jwtAuth, multer.single("image"), uploadPicture);

router
  .route("/dashboard/profile/update-pic")
  .post(jwtAuth, multer.single("image"), updatePicture);

router.route("/dashboard/profile/delete-pic").delete(jwtAuth, deletePicture);

router.route("/dashboard/profile/get-pic/").get(jwtAuth, getPicture);

router
  .route("/get-unverified-vendor")
  .get(jwtAuth, checkRole(["admin"]), getUnverifieds);

router.route("/get-vendors").get(jwtAuth, checkRole(["admin"]), getVendors);

router
  .route("/get-vendorsByservice")
  .get(jwtAuth, checkRole(["admin"]), getVendorsByServices);

router.route("/verification").post(jwtAuth, checkRole(["admin"]), verification);

router.route("/email-verification").post(jwtAuth, emailVerification_V1);

router.route("/email-verification").get(emailVerification_V2);

router.route("/reset-password").post(checkEmail);

router.route("/reset-password/:id/:token").get(forgotPassword);

router.route("/change-password").post(jwtAuth, changePassword);

router
  .route("/get-cinema-posts")
  .get(jwtAuth, userVerify, getCinemaAppServices);

router.route("/get-hotel-posts").get(jwtAuth, userVerify, getHotelAppServices);

router
  .route("/get-studio-posts")
  .get(jwtAuth, userVerify, getStudioAppServices);

router.route("/get-food-posts").get(jwtAuth, userVerify, getFoodAppServices);

router
  .route("/get-gaming-posts")
  .get(jwtAuth, userVerify, getGamingAppServices);

router.route("/get-rent-posts").get(jwtAuth, userVerify, getRentAppServices);

router.route("/get-cinema-bytitle").get(jwtAuth, userVerify, getCinemaByTitle);

router.route("/get-hotel-bytitle").get(jwtAuth, userVerify, getHotelByTitle);

router.route("/get-studio-bytitle").get(jwtAuth, userVerify, getStudioByTitle);

router.route("/get-food-bytitle").get(jwtAuth, userVerify, getFoodByTitle);

router.route("/get-gaming-bytitle").get(jwtAuth, userVerify, getGamingByTitle);

router.route("/get-rent-bytitle").get(jwtAuth, userVerify, getRentByTitle);

//----------------------------------ID----------------------------------
router.route("/get-cinema-byid/:id").get(jwtAuth, userVerify, getCinemaById);

router.route("/get-hotel-byid/:id").get(jwtAuth, userVerify, getHotelById);

router.route("/get-studio-byid/:id").get(jwtAuth, userVerify, getStudioById);

router.route("/get-food-byid/:id").get(jwtAuth, userVerify, getFoodById);

router.route("/get-gaming-byid/:id").get(jwtAuth, userVerify, getGameById);

router.route("/get-rent-byid/:id").get(jwtAuth, userVerify, getRentById);

//-------------------------------------------------------------------

// router
// .route('/get-cinema-byuser')
// .get(jwtAuth, getCinemaForUser)

// router
// .route('/get-hotel-byuser')
// .get(jwtAuth, getHotelForUser)

// router
// .route('/get-studio-byuser')
// .get(jwtAuth, getStudioForUser)

// router
// .route('/get-gaming-byuser')
// .get(jwtAuth, getGamingForUser)

// router
// .route('/get-food-byuser')
// .get(jwtAuth, getFoodForUser);

// router
// .route('/get-rent-byuser')
// .get(jwtAuth, getRentForUser)

router.post("/bookHotel", jwtAuth, bookHotel);
router.get("/getUserBookings", jwtAuth, getUserbookings);
router.get("/getBooking/:bookingId", jwtAuth, getAppbooking);

//---------------------Rent-------------------------------
router.post("/bookRent/:rentId", jwtAuth, bookRent);
router.get("/getUserRentBookings", jwtAuth, getUserRentbookings);
router.get("/getRentBooking/:bookingId", jwtAuth, getAppRentbooking);

router.post("/bookStudio/:studioId", jwtAuth, bookStudio);
router.get("/getUserStudioBookings", jwtAuth, getUserStudiobookings);
router.get("/getStudioBooking/:bookingId", jwtAuth, getAppStudiobooking);

router.post("/bookCinema/:cinemaId", jwtAuth, bookCinema);
router.get("/getUserCinemaBookings", jwtAuth, getUserCinemabookings);
router.get("/getCinemaBooking/:bookingId", jwtAuth, getAppCinemabooking);

router.post("/bookGame/:gameId", jwtAuth, bookGame);
router.get("/getUserGameBookings", jwtAuth, getUserGamebookings);
router.get("/getGameBooking/:bookingId", jwtAuth, getAppGamebooking);

// router
// .get('/getRestuarant/:id', jwtAuth, getRestuarant)

// router
// .get('/getRestuarants', jwtAuth, getRestuarants)

//--------------------------Ads-------------------------
router.get("/getAllAds", getAppAllAds);
router.get("/getAdsById/:id", jwtAuth, getAdById);
//------------------------------------------------------

//-------------------------------Food Ordering--------------------
router.post("/addFoodtocart/:foodId", jwtAuth, AddCart);
router.get("/viewcart", jwtAuth, viewCart);
router.delete("/deletecartitem/:cartitemId", jwtAuth, DeleteCartItem);
router.put("/addItemQuantity/:cartitemId", jwtAuth, addQty);
router.put("/substractItemQuantity/:cartitemId", jwtAuth, substractQty);
router.put("/createOrder", jwtAuth, createOrder);
router.get("/getOrders", jwtAuth, viewOrders);
router.get("/getOrder/:orderId", jwtAuth, viewAppOrder);
router.put("/updateOrderStatus/:orderId", jwtAuth, updateOrderStatus);
router.post("/buyFoodNow/:foodId", jwtAuth, buyFood);

//-----------------------------Support--------------------------------
router.post("/support", jwtAuth, support);

//-----------------------------Cinema Review--------------------------
router.post("/addCinemaReview/:cinemaId", jwtAuth, addCinemaReview);
router.get("/getCinemaReviews/:cinemaId", jwtAuth, getCinemaReviews);
router.get("/getUserCinemaReviews/:userId", jwtAuth, getUserCinemaReviews);
router.get("/getUserCinemaReview/:userId/:cinemaId", jwtAuth, getUserCinemaReview);
router.get("/getAllCinemaReviews", jwtAuth, getAllCinemaReviews);
router.delete("/deleteCinemaReview/:reviewId", jwtAuth, deleteCinemaReview);

//-----------------------------Food Review--------------------------
router.post("/addFoodReview/:foodId", jwtAuth, addFoodReview);
router.get("/getFoodReviews/:foodId", jwtAuth, getFoodReviews);
router.get("/getUserFoodReviews/:userId", jwtAuth, getUserFoodReviews);
router.get("/getUserFoodReview/:userId/:foodId", jwtAuth, getUserFoodReview);
router.get("/getAllFoodReviews", jwtAuth, getAllFoodReviews);
router.delete("/deleteFoodReview/:reviewId", jwtAuth, deleteFoodReview);

//-----------------------------Game Review--------------------------
router.post("/addGameReview/:gameId", jwtAuth, addGameReview);
router.get("/getGameReviews/:gameId", jwtAuth, getGameReviews);
router.get("/getUserGameReviews/:userId", jwtAuth, getUserGameReviews);
router.get("/getUserGameReview/:userId/:gameId", jwtAuth, getUserGameReview);
router.get("/getAllGameReviews", jwtAuth, getAllGameReviews);
router.delete("/deleteGameReview/:reviewId", jwtAuth, deleteGameReview);

//-----------------------------Studio Review--------------------------
router.post("/addStudioReview/:studioId", jwtAuth, addStudioReview);
router.get("/getStudioReviews/:studioId", jwtAuth, getStudioReviews);
router.get("/getUserStudioReviews/:userId", jwtAuth, getUserStudioReviews);
router.get("/getUserStudioReview/:userId/:studioId", jwtAuth, getUserStudioReview);
router.get("/getAllStudioReviews", jwtAuth, getAllStudioReviews);
router.delete("/deleteStudioReview/:reviewId", jwtAuth, deleteStudioReview);

//-----------------------------Rent Review--------------------------
router.post("/addRentReview/:rentId", jwtAuth, addRentReview);
router.get("/getRentReviews/:rentId", jwtAuth, getRentReviews);
router.get("/getUserRentReviews/:userId", jwtAuth, getUserRentReviews);
router.get("/getUserRentReview/:userId/:rentId", jwtAuth, getUserRentReview);
router.get("/getAllRentReviews", jwtAuth, getAllRentReviews);
router.delete("/deleteRentReview/:reviewId", jwtAuth, deleteRentReview);

//-----------------------------Hotel Review--------------------------
router.post("/addHotelReview/:hotelId", jwtAuth, addHotelReview);
router.get("/getHotelReviews/:hotelId", jwtAuth, getHotelReviews);
router.get("/getUserHotelReviews/:userId", jwtAuth, getUserHotelReviews);
router.get("/getUserHotelReview/:userId/:hotelId", jwtAuth, getUserHotelReview);
router.get("/getAllHotelReviews", jwtAuth, getAllHotelReviews);
router.delete("/deleteHotelReview/:reviewId", jwtAuth, deleteHotelReview);

module.exports = router;
