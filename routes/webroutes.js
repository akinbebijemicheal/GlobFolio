const express = require('express');
const router = express.Router();
const multer = require('../util/multer');
const { profile, userAuth, RegisterUser, webLoginUser, checkRole, getUser, getUsers, updateUser, deleteUser } = require('../controllers/user2');
const {checkEmail, changePassword, forgotPassword, emailVerification_V1, emailVerification_V2} = require('../controllers/security2');
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
.get('/', (req, res) =>{
    res.render('base/index')
})

router
.get('/about', (req, res) =>{
    res.render('base/about')
})

router
.get('/contact', (req, res) =>{
    res.render('base/contact')
})

router
.get('/faq', (req, res) =>{
    res.render('base/faq')
})

router
.get('/services', (req, res) =>{
    res.render('base/services')
})

router
.get('/pricing', (req, res) =>{
    res.render('base/pricing')
})

router
.get('/registration-type', (req, res) => {
    res.render('base/registration-type')
})

router
.get('/register-user', (req, res) => {
    res.render('base/signup') 
});

router
.get('/register-vendor', (req, res) => {
    res.render('base/vendor')
    
});

router
.get('/register-admin', (req, res) => {
    res.render('base/admin-register')
    
});

router
.get('/login-user', (req, res) => {
    res.render('base/userlogin')
});

router
.get('/login-vendor', (req, res) => {
    res.render('base/vendorlogin')
});

router
.get('/login-admin', (req, res) => {
    res.render('base/admin-login')
});

router
.get('/dashboard/user', userAuth, (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/user/index', {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/user/bonus', userAuth, (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/user/bonus',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/user/cinema', userAuth, (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/user/cinema',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/user/food', userAuth, (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/user/food',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/user/forgot', userAuth, (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/user/forgot',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/user/game',userAuth, (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/user/game',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/user/hotel', userAuth, (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/user/hotel',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/user/rent', userAuth, (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/user/rent',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/user/studio', userAuth, (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/user/studio',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})


router
.get('/dashboard/admin', userAuth, checkRole(["admin"]), (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/index', {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})



router
.get('/dashboard/admin/cinema', userAuth, checkRole(["admin"]), (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/cinema',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/food', userAuth, checkRole(["admin"]), (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/food',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/forgot', userAuth, checkRole(["admin"]), (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/forgot',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/game',userAuth, checkRole(["admin"]),(req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/game',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/hotel', userAuth, checkRole(["admin"]), (req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/hotel',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/rent', userAuth, checkRole(["admin"]),(req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/rent',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/studio', userAuth, checkRole(["admin"]),(req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/studio',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/add-seller', userAuth, checkRole(["admin"]),(req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/add-seller',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/create-user', userAuth, checkRole(["admin"]),(req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/create-user',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/view-seller', userAuth, checkRole(["admin"]),(req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/view-seller',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})

router
.get('/dashboard/admin/view-user', userAuth, checkRole(["admin"]),(req, res)=>{
    let name = req.user.fullname.split(' ')
    let email = req.user.email
    res.render('dashboard/admin/view-user',  {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email
    })
})


//-----------------------------------------------------------------------------------------------
// post requests for information
//User
router
.post('/register-user', async (req, res) => {
    await RegisterUser("user", req, res)
    //res.redirect('/login-user')
});

router
.post('/login-user', async (req, res) => {
    await webLoginUser("user", req, res);
    //res.redirect('/dashboard/user')
});

//vendor
router
.post('/register-vendor', async (req, res) => {
    await RegisterUser("vendor", req, res)
    //res.redirect('/login-vendor')
});

router
.post('/login-vendor', async (req, res) => {
    await webLoginUser("vendor", req, res);
    //res.redirect('/dashboard/vendor')
});

//admin
router
.post('/register-admin', async (req, res) => {
    await RegisterUser("admin", req, res)
    //res.redirect('login-admin')
});

router
.post('/login-admin', async (req, res) => {
    await webLoginUser("admin", req, res);
    //res.redirect('/dashboard/admin')
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
.route('/email-verification')
.get(emailVerification_V2);
//------------------------------------------Forgot Password-------------------------------
router
.route('/forgot-password')
.get((req, res) =>{
    res.render('base/forgot')
});

router
.route('/forgot-password')
.post(checkEmail);

router
.route('/reset-password/:id/:token')
.get(forgotPassword);

router
.route('/change-password')
.post(userAuth, changePassword);

//----------------------------------------------------------------------------------------

router
.route('/create-cinema-post')
.post(userAuth, checkRole(["admin"]) ,multer.single("image"), createCinemaService);

router
.route('/create-hotel-post')
.post(userAuth, checkRole(["vendor"]) ,multer.single("image"), createHotelService);

router
.route('/create-food-post')
.post(userAuth, checkRole(["vendor"]) ,multer.single("image"), createFoodService);

router
.route('/create-studio-post')
.post(userAuth, checkRole(["admin"]) ,multer.single("image"), createStudioService);

router
.route('/create-gaming-post')
.post(userAuth, checkRole(["admin"]) ,multer.single("image"), createGamingService);

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
.patch(userAuth, checkRole(["vendor"]) ,multer.single("image"),  updateCinema)

router
.route('/update-hotel-byuser')
.patch(userAuth, checkRole(["vendor"]) ,multer.single("image"), updateHotel)

router
.route('/update-studio-byuser')
.patch(userAuth, checkRole(["vendor"]) ,multer.single("image"), updateStudio)

router
.route('/update-gaming-byuser')
.patch(userAuth, checkRole(["vendor"]) ,multer.single("image"), updateGaming)

router
.route('/update-food-byuser')
.patch(userAuth, checkRole(["vendor"]) ,multer.single("image"), updateFood);

router
.route('/update-rent-byuser')
.patch(userAuth, checkRole(["vendor"]) ,multer.single("image"), updateRent);

router
.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.clearCookie('jwt');
    res.redirect('/')
    
});

module.exports = router;