const express = require('express');
const router = express.Router();
const multer = require('../util/multer');
const { profile, RegisterUser, LoginUser, checkRole, getUser, getUsers, updateUser, deleteUser } = require('../controllers/user');
const {checkEmail, changePassword, forgotPassword} = require('../controllers/security');
const { createPost, getPosts, getPostByTitle, getPostForServices, getPostForUser} = require('../controllers/post');
const {  verification, getUnverifieds, getVendors, getVendorsByServices} = require('../controllers/vendor')
const { updatePicture, uploadPicture, deletePicture, getPicture} = require('../controllers/picture')
const jwtAuth = require('../middleware/jwtAuth');

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
.route('/reset-password')
.post(checkEmail);

router
.route('/reset-password/:id/:token')
.post(forgotPassword);

router
.route('/change-password')
.post(jwtAuth, changePassword);

router
.route('/create-post')
.post(jwtAuth, createPost);

router
.route('/getposts')
.get(jwtAuth, getPosts)

router
.route('/getpostsbyservices')
.post(jwtAuth, getPostForServices);

router
.route('/getpostsbytiltle')
.post(jwtAuth, getPostByTitle)

router
.route('/getpostsbuser')
.get(jwtAuth, getPostForUser)


module.exports = router;