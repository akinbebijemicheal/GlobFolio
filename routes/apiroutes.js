const express = require('express');
const router = express.Router();
const multer = require('../util/multer');
const { profile, RegisterUser, LoginUser, checkRole, getUser, getUsers, updateUser, deleteUser } = require('../controllers/user');
const {checkEmail, changePassword, forgotPassword, emailVerification_V1, emailVerification_V2} = require('../controllers/security');
//const { createPost, getPosts, getPostByTitle, getPostForServices, getPostForUser} = require('../controllers/post');
const {  verification, getUnverifieds, getVendors, getVendorsByServices} = require('../controllers/vendor')
const { updatePicture, uploadPicture, deletePicture, getPicture} = require('../controllers/picture')
const jwtAuth = require('../middleware/jwtAuth');
const { getCinemaServices, getCinemaByTitle, getCinemaForUser} = require('../controllers/services/cinema');
const {getFoodByTitle, getFoodForUser, getFoodServices} = require('../controllers/services/food');
const { getHotelByTitle, getHotelForUser, getHotelServices } = require('../controllers/services/hotel');
const { getRentByTitle, getRentForUser, getRentServices} = require('../controllers/services/renting');
const {getStudioByTitle, getStudioForUser, getStudioServices} = require('../controllers/services/studio_book');
const { getGamingByTitle, getGamingForUser, getGamingServices} = require('../controllers/services/vr_gaming');


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
.patch(jwtAuth, multer.single("image"), updatePicture);

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
.route('/email-verification/:id/:token')
.post(emailVerification_V2);

router
.route('/reset-password')
.post(checkEmail);

router
.route('/reset-password/:id/:token')
.post(forgotPassword);

router
.route('/change-password')
.post(jwtAuth, changePassword);


router
.route('/get-cinema-posts')
.get(jwtAuth, getCinemaServices)

router
.route('/get-hotel-posts')
.get(jwtAuth, getHotelServices)

router
.route('/get-studio-posts')
.get(jwtAuth, getStudioServices)

router
.route('/get-food-posts')
.get(jwtAuth, getFoodServices)

router
.route('/get-gaming-posts')
.get(jwtAuth, getGamingServices)

router
.route('/get-rent-posts')
.get(jwtAuth, getRentServices)


router
.route('/get-cinema-bytitle')
.post(jwtAuth, getCinemaByTitle)

router
.route('/get-hotel-bytitle')
.post(jwtAuth, getHotelByTitle)

router
.route('/get-studio-bytitle')
.post(jwtAuth, getStudioByTitle)

router
.route('/get-food-bytitle')
.post(jwtAuth, getFoodByTitle)

router
.route('/get-gaming-bytitle')
.post(jwtAuth, getGamingByTitle)

router
.route('/get-rent-bytitle')
.post(jwtAuth, getRentByTitle)


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


/*router
.route('/create-post')
.post(jwtAuth, checkRole(["vendor"]) ,multer.single("image"), createPost);

router
.route('/getposts')
.get(jwtAuth, getPosts)

router
.route('/getpostsbyservices')
.get(jwtAuth, getPostForServices);

router
.route('/getpostsbytitle')
.get(jwtAuth, getPostByTitle)

router
.route('/getpostsbyuser')
.get(jwtAuth, getPostForUser) */


module.exports = router;