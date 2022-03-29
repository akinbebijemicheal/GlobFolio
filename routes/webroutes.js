const express = require('express');
const router = express.Router();
const multer = require('../util/multer');
const { profile, userAuth, RegisterUser, webLoginUser, checkRole, getUser, getUsers, updateUser, deleteUser } = require('../controllers/user');
const {checkEmail, changePassword, forgotPassword} = require('../controllers/security');
const { createPost, getPosts, getPostByTitle, getPostForServices, getPostForUser} = require('../controllers/post');
const {  verification, getUnverifieds, getVendors, getVendorsByServices} = require('../controllers/vendor')
const { updatePicture, uploadPicture, deletePicture, getPicture} = require('../controllers/picture')


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
.route('/reset-password')
.post(checkEmail);

router
.route('/reset-password/:id/:token')
.post(forgotPassword);

router
.route('/change-password')
.post(userAuth, changePassword);

router
.route('/create-post')
.post(userAuth, createPost);

router
.route('/getposts')
.get(userAuth, getPosts)

router
.route('/getpostsbyservices')
.post(userAuth, getPostForServices);

router
.route('/getpostsbytiltle')
.post(userAuth, getPostByTitle)

router
.route('/getpostsbuser')
.get(userAuth, getPostForUser)

router
.post('/logout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
       return res.json('successfully logged out')
    })
    res.clearCookie('jwt');
    
   // return res.redirect('/dashboard')
});

module.exports = router;