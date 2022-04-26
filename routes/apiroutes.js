const express = require('express');
const router = express.Router();
const multer = require('../util/multer2');
const { profile, RegisterUser, LoginUser, checkRole, getUser, getUsers, updateUser, deleteUser } = require('../controllers/user');
const {checkEmail, changePassword, forgotPassword, emailVerification_V1, emailVerification_V2} = require('../controllers/security');
const {  verification, getUnverifieds, getVendors, getVendorsByServices} = require('../controllers/vendor')
const { updatePicture, uploadPicture, deletePicture, getPicture} = require('../controllers/picture')
const jwtAuth = require('../middleware/jwtAuth');
const { getCinemaServices, getCinemaByTitle, getCinemaForUser, getCinemaById} = require('../controllers/services/cinema');
const {getFoodByTitle, getFoodForUser, getFoodServices, getFoodById} = require('../controllers/services/food');
const { getHotelByTitle, getHotelForUser, getHotelServices, getHotelById } = require('../controllers/services/hotel');
const { getRentByTitle, getRentForUser, getRentServices, getRentById} = require('../controllers/services/renting');
const {getStudioByTitle, getStudioForUser, getStudioServices, getStudioById} = require('../controllers/services/studio_book');
const { getGamingByTitle, getGamingForUser, getGamingServices, getGameById} = require('../controllers/services/vr_gaming');
const userVerify = require("../middleware/verify")


//user
router
.post('/register-user', async (req, res) => {
    await RegisterUser("user", req, res)
});

router
.post('/signin-user', async (req, res) => {
    await LoginUser("user", req, res);
});

//vendor
router
.post('/register-vendor', async (req, res) => {
    await RegisterUser("vendor", req, res)
});
        

router
.post('/signin-vendor', async (req, res) => {
    await LoginUser("vendor", req, res);
});

//admin
router
.post('/register-admin', async (req, res) => {
    await RegisterUser("admin", req, res)
});

router
.post('/signin-admin', async (req, res) => {
    await LoginUser("admin", req, res);
});

router
.route('/dashboard/profile')
.get(jwtAuth, async(req, res) => { 
    return res.json(profile(req.user)) 
});

router
.route('/dashboard/profile/update')
.post(jwtAuth, updateUser);

router
.route('/dashboard/profile/upload-pic')
.post(jwtAuth, multer.single("image") ,uploadPicture);

router
.route('/dashboard/profile/update-pic')
.post(jwtAuth, multer.single("image"), updatePicture);

router
.route('/dashboard/profile/delete-pic')
.delete(jwtAuth, deletePicture);

router
.route('/dashboard/profile/get-pic/')
.get(jwtAuth, getPicture);


router
.route('/get-unverified-vendor')
.get(jwtAuth, checkRole(["admin"]), getUnverifieds)

router
.route('/get-vendors')
.get(jwtAuth, checkRole(["admin"]), getVendors)

router
.route('/get-vendorsByservice')
.get(jwtAuth, checkRole(["admin"]), getVendorsByServices)

router
.route('/verification')
.post(jwtAuth, checkRole(["admin"]), verification)

router
.route('/email-verification')
.post(jwtAuth, emailVerification_V1);

router
.route('/email-verification')
.get(emailVerification_V2);

router
.route('/reset-password')
.post(checkEmail);

router
.route('/reset-password/:id/:token')
.get(forgotPassword);

router
.route('/change-password')
.post(jwtAuth, changePassword);


router
.route('/get-cinema-posts')
.get(jwtAuth, userVerify, getCinemaServices)

router
.route('/get-hotel-posts')
.get(jwtAuth, userVerify, getHotelServices)

router
.route('/get-studio-posts')
.get(jwtAuth, userVerify, getStudioServices)

router
.route('/get-food-posts')
.get(jwtAuth, userVerify, getFoodServices)

router
.route('/get-gaming-posts')
.get(jwtAuth, userVerify, getGamingServices)

router
.route('/get-rent-posts')
.get(jwtAuth, userVerify, getRentServices)


router
.route('/get-cinema-bytitle')
.get(jwtAuth, userVerify, getCinemaByTitle)

router
.route('/get-hotel-bytitle')
.get(jwtAuth, userVerify, getHotelByTitle)

router
.route('/get-studio-bytitle')
.get(jwtAuth, userVerify, getStudioByTitle)

router
.route('/get-food-bytitle')
.get(jwtAuth, userVerify, getFoodByTitle)

router
.route('/get-gaming-bytitle')
.get(jwtAuth, userVerify, getGamingByTitle)

router
.route('/get-rent-bytitle')
.get(jwtAuth, userVerify, getRentByTitle)

//----------------------------------ID----------------------------------
router
.route('/get-cinema-byid/:id')
.get(jwtAuth, userVerify, getCinemaById)

router
.route('/get-hotel-byid/:id')
.get(jwtAuth, userVerify, getHotelById)

router
.route('/get-studio-byid/:id')
.get(jwtAuth, userVerify, getStudioById)

router
.route('/get-food-byid/:id')
.get(jwtAuth, userVerify, getFoodById)

router
.route('/get-gaming-byid/:id')
.get(jwtAuth, userVerify, getGameById)

router
.route('/get-rent-byid/:id')
.get(jwtAuth, userVerify, getRentById)

//-------------------------------------------------------------------

router
.route('/get-cinema-byuser')
.get(jwtAuth, getCinemaForUser)

router
.route('/get-hotel-byuser')
.get(jwtAuth, getHotelForUser)

router
.route('/get-studio-byuser')
.get(jwtAuth, getStudioForUser)

router
.route('/get-gaming-byuser')
.get(jwtAuth, getGamingForUser)

router
.route('/get-food-byuser')
.get(jwtAuth, getFoodForUser);

router
.route('/get-rent-byuser')
.get(jwtAuth, getRentForUser)



module.exports = router;