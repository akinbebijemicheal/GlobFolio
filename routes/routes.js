const express = require('express');
const router = express.Router();
const { profile, userAuth, RegisterUser, LoginUser, checkRole, getUser, getUsers, updateUser, deleteUser } = require('../controllers/user');
const {checkEmail, changePassword, forgotPassword} = require('../controllers/security');
const { createPost, getPosts, getPostByTitle, getPostForServices, getPostForUser} = require('../controllers/post');
const {  verification, getUnverifieds, getVendors, getVendorsByServices} = require('../controllers/vendor')



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
.get(userAuth, async(req, res) => { 
    return res.json(profile(req.user)) 
});

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


module.exports = router;