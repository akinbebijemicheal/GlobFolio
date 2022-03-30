const express = require('express');
const router = express.Router();
const multer = require('../util/multer');
const { profile, userAuth, RegisterUser, webLoginUser, checkRole, getUser, getUsers, updateUser, deleteUser } = require('../controllers/user');
const {checkEmail, changePassword, forgotPassword, emailVerification_V1, emailVerification_V2} = require('../controllers/security');
//const { createPost, getPosts, getPostByTitle, getPostForServices, getPostForUser} = require('../controllers/post');
const {  verification, getUnverifieds, getVendors, getVendorsByServices} = require('../controllers/vendor')
const { updatePicture, uploadPicture, deletePicture, getPicture} = require('../controllers/picture')
const { createCinemaService, getCinemaServices, getCinemaByTitle, getCinemaForUser, updateCinema} = require('../controllers/services/cinema');
const { createFoodService, getFoodByTitle, getFoodForUser, getFoodServices, updateFood} = require('../controllers/services/food');
const { createHotelService, getHotelByTitle, getHotelForUser, getHotelServices, updateHotel } = require('../controllers/services/hotel');
const {  createRentService, getRentByTitle, getRentForUser, getRentServices, updateRent} = require('../controllers/services/renting');
const {  createStudioService, getStudioByTitle, getStudioForUser, getStudioServices, updateStudio} = require('../controllers/services/studio_book');
const {  createGamingService, getGamingByTitle, getGamingForUser, getGamingServices, updateGaming} = require('../controllers/services/vr_gaming');


//user
router
.post('/register-user', async (req, res) => {
    await RegisterUser("user", req, res)
});

router
.post('/signin-user', async (req, res) => {
    await webLoginUser("user", req, res);
});

//vendor
router
.post('/register-vendor', async (req, res) => {
    await RegisterUser("vendor", req, res)
});
        

router
.post('/signin-vendor', async (req, res) => {
    await webLoginUser("vendor", req, res);
});

//admin
router
.post('/register-admin', async (req, res) => {
    await RegisterUser("admin", req, res)
});

router
.post('/signin-admin', async (req, res) => {
    await webLoginUser("admin", req, res);
});

router
.route('/dashboard/profile')
.get(userAuth, async(req, res) => { 
    return res.json(profile(req.user)) 
});

router
.route('/dashboard/profile/update')
.post(userAuth, updateUser);

router
.route('/dashboard/profile/upload-pic')
.post(userAuth, multer.single("image") ,uploadPicture);

router
.route('/dashboard/profile/update-pic')
.patch(userAuth, multer.single("image"), updatePicture);

router
.route('/dashboard/profile/delete-pic')
.delete(userAuth, deletePicture);

router
.route('/dashboard/profile/get-pic/')
.get(userAuth, getPicture);


router
.route('/get-unverified-vendor')
.get(userAuth, checkRole(["admin"]), getUnverifieds)

router
.route('/get-vendors')
.get(userAuth, checkRole(["admin"]), getVendors)

router
.route('/get-vendorsByservice')
.get(userAuth, checkRole(["admin"]), getVendorsByServices)

router
.route('/verification')
.post(userAuth, checkRole(["admin"]), verification)

router
.route('/email-verification')
.post(userAuth, emailVerification_V1);

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
.post(userAuth, changePassword);

router
.route('/create-cinema-post')
.post(userAuth, checkRole(["vendor"]) ,multer.single("image"), createCinemaService);

router
.route('/create-hotel-post')
.post(userAuth, checkRole(["vendor"]) ,multer.single("image"), createHotelService);

router
.route('/create-food-post')
.post(userAuth, checkRole(["vendor"]) ,multer.single("image"), createFoodService);

router
.route('/create-studio-post')
.post(userAuth, checkRole(["vendor"]) ,multer.single("image"), createStudioService);

router
.route('/create-gaming-post')
.post(userAuth, checkRole(["vendor"]) ,multer.single("image"), createGamingService);

router
.route('/create-rent-post')
.post(userAuth, checkRole(["vendor"]) ,multer.single("image"), createRentService);

router
.route('/get-cinema-posts')
.get(userAuth, getCinemaServices)

router
.route('/get-hotel-posts')
.get(userAuth, getHotelServices)

router
.route('/get-studio-posts')
.get(userAuth, getStudioServices)

router
.route('/get-food-posts')
.get(userAuth, getFoodServices)

router
.route('/get-gaming-posts')
.get(userAuth, getGamingServices)

router
.route('/get-rent-posts')
.get(userAuth, getRentServices)


router
.route('/get-cinema-bytitle')
.post(userAuth, getCinemaByTitle)

router
.route('/get-hotel-bytitle')
.post(userAuth, getHotelByTitle)

router
.route('/get-studio-bytitle')
.post(userAuth, getStudioByTitle)

router
.route('/get-food-bytitle')
.post(userAuth, getFoodByTitle)

router
.route('/get-gaming-bytitle')
.post(userAuth, getGamingByTitle)

router
.route('/get-rent-bytitle')
.post(userAuth, getRentByTitle)


router
.route('/get-cinema-byuser')
.get(userAuth, getCinemaForUser)

router
.route('/get-hotel-byuser')
.get(userAuth, getHotelForUser)

router
.route('/get-studio-byuser')
.get(userAuth, getStudioForUser)

router
.route('/get-gaming-byuser')
.get(userAuth, getGamingForUser)

router
.route('/get-food-byuser')
.get(userAuth, getFoodForUser);

router
.route('/get-rent-byuser')
.get(userAuth, getRentForUser)


router
.route('/update-cinema-byuser')
.patch(userAuth, updateCinema)

router
.route('/update-hotel-byuser')
.patch(userAuth, updateHotel)

router
.route('/update-studio-byuser')
.patch(userAuth, updateStudio)

router
.route('/update-gaming-byuser')
.patch(userAuth, updateGaming)

router
.route('/update-food-byuser')
.patch(userAuth, updateFood);

router
.route('/update-rent-byuser')
.patch(userAuth, updateRent)



/*router
.route('/create-post')
.post(userAuth, checkRole(["vendor"]) ,multer.single("image"), createPost);

router
.route('/getposts')
.get(userAuth, getPosts)

router
.route('/getpostsbyservices')
.post(userAuth, getPostForServices);

router
.route('/getpostsbytitle')
.post(userAuth, getPostByTitle)

router
.route('/getpostsbyuser')
.get(userAuth, getPostForUser)

router
.post('/logout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
       return res.json('successfully logged out')
    })
    res.clearCookie('jwt');
    
   // return res.redirect('/dashboard')
});*/

module.exports = router;