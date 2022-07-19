const express = require("express");
const router = express.Router();
const upload = require("../util/multer");
const multer = require("../util/multer2");
const store = require('store')
const {
  profile,
  userAuth,
  updateUserForgot,
  RegisterAdmin,
  webLoginAdmin,
  checkRole,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/user2");
const {
  RegisterUser
} = require("../controllers/user");
const {
  checkEmail,
  changePassword,
  forgotPassword,
  emailVerification_V1,
  emailVerification_V2,
} = require("../controllers/security2");
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
const {
  createCinemaService,
  getCinemaServices,
  getCinemaByTitle,
  getCinemaForUser,
  updateCinema,
  uploadCinemaImage,
  RemoveCinemaImage,
} = require("../controllers/services/cinema");
const {
  createFoodService,
  getFoodByTitle,
  getFoodForUser,
  getFoodServices,
  updateFood,
  uploadFoodImage,
  RemoveFoodImage,
} = require("../controllers/services/food");
const {
  createHotelService,
  getHotelByTitle,
  getHotelForUser,
  getHotelServices,
  updateHotel,
  uploadHotelImage,
  RemoveHotelImage,
} = require("../controllers/services/hotel");
const {
  createRentService,
  getRentByTitle,
  getRentForUser,
  getRentServices,
  updateRent,
  uploadRentImage,
  RemoveRentImage,
} = require("../controllers/services/renting");
const {
  createStudioService,
  getStudioByTitle,
  getStudioForUser,
  getStudioServices,
  updateStudio,
  uploadStudioImage,
  RemoveStudioImage,
} = require("../controllers/services/studio_book");
const {
  createGamingService,
  getGamingByTitle,
  getGamingForUser,
  getGamingServices,
  updateGaming,
  uploadGameImage,
  RemoveGameImage,
} = require("../controllers/services/vr_gaming");
const {
  createAds,
  getAdById,
  getAllAds,
  updateAds,
  deleteAds,
} = require("../controllers/ads");
const { Checkout, viewOrders, viewOrder, viewAdminOrder } = require("../controllers/food_cart");
const { getbookings, getbooking, hotelverify } = require("../controllers/Hotelbookings");
const { getRentbookings, getRentbooking, rentVerify } = require("../controllers/rentbooking");
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
.get('/gallery', (req, res) =>{
    res.render('base/gallery')
})

router
.get('/pricing', (req, res) =>{
    res.render('base/pricing')
})

router
.get('/privacy', (req, res) =>{
    res.render('base/privacy')
})

router
.get('/terms', (req, res) =>{
    res.render('base/terms')
})

// router
// .get('/registration-type', (req, res) => {
//     res.render('base/registration-type')
// })

router
.get('/register-user', (req, res) => {
    res.render('base/signup')
});

// router
// .get('/register-vendor', (req, res) => {
//     res.render('base/vendor-sign-up')

// });

router
.get('/register-admin', (req, res) => {
    res.render('base/admin-register')

});

router
.get('/login-user', (req, res) => {
    res.render('base/userlogin')
});

// router
// .get('/login-vendor', (req, res) => {
//     res.render('base/vendorlogin')
// });

router
.get('/login-admin', (req, res) => {
    res.render('base/admin-login')
});

// router
// .get('/dashboard/user', userAuth, (req, res)=>{
//     let name = req.user.fullname.split(' ')
//     let email = req.user.email
//     res.render('dashboard/user/index', {
//         user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
//         email: email
//     })
// })

// router
// .get('/dashboard/user/bonus', userAuth, (req, res)=>{
//     let name = req.user.fullname.split(' ')
//     let email = req.user.email
//     res.render('dashboard/user/bonus',  {
//         user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
//         email: email
//     })
// })

// router
// .get('/dashboard/user/cinema', userAuth, (req, res)=>{
//     let name = req.user.fullname.split(' ')
//     let email = req.user.email
//     res.render('dashboard/user/cinema',  {
//         user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
//         email: email
//     })
// })

// router
// .get('/dashboard/user/food', userAuth, (req, res)=>{
//     let name = req.user.fullname.split(' ')
//     let email = req.user.email
//     res.render('dashboard/user/food',  {
//         user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
//         email: email
//     })
// })

// router
// .get('/dashboard/user/forgot', userAuth, (req, res)=>{
//     let name = req.user.fullname.split(' ')
//     let email = req.user.email
//     res.render('dashboard/user/forgot',  {
//         user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
//         email: email
//     })
// })

// router
// .get('/dashboard/user/game',userAuth, (req, res)=>{
//     let name = req.user.fullname.split(' ')
//     let email = req.user.email
//     res.render('dashboard/user/game',  {
//         user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
//         email: email
//     })
// })

// router
// .get('/dashboard/user/hotel', userAuth, (req, res)=>{
//     let name = req.user.fullname.split(' ')
//     let email = req.user.email
//     res.render('dashboard/user/hotel',  {
//         user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
//         email: email
//     })
// })

// router
// .get('/dashboard/user/rent', userAuth, (req, res)=>{
//     let name = req.user.fullname.split(' ')
//     let email = req.user.email
//     res.render('dashboard/user/rent',  {
//         user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
//         email: email
//     })
// })

// router
// .get('/dashboard/user/studio', userAuth, (req, res)=>{
//     let name = req.user.fullname.split(' ')
//     let email = req.user.email
//     res.render('dashboard/user/studio',  {
//         user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
//         email: email
//     })
// })

router.get("/dashboard/admin", userAuth, checkRole(["admin"]), (req, res) => {
  let name = req.user.fullname.split(" ");
  let email = req.user.email;
  res.render("dashboard/admin/index", {
    user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
    email: email,
  });
});

router.get(
  "/dashboard/admin/cinema-recently-bought-tickets",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/cinema-recently-bought-tickets", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/food-recent-orders",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/food-recent-orders", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);
router.get(
  "/dashboard/admin/food-upload",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/food-upload", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);
router.get(
  "/dashboard/admin/food-products",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/food-products", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/forgot",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/forgot", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

// router.post('/dashboard/admin/forgot', async (req, res) => {
//   await updateUserForgot("user", req, res)
//   res.redirect('/login-user')
// });

router.post('/forgot-password', async (req, res) => {
  await updateUserForgot(req, res)
  res.redirect('/login-user')
});



router.get(
  "/dashboard/admin/game",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/game", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/hotel-upload",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/hotel-upload", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/hotel-new-bookings",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/hotel-new-bookings", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/rent",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/rent", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/studio-recent-bookings",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/studio-recent-bookings", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/add-seller",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/add-seller", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/create-user",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/create-user", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/view-seller",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/view-seller", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.get(
  "/dashboard/admin/view-user", getUsers, 
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    data = JSON.parse(store.get("users"));
    console.log(data)
    res.render("dashboard/admin/view-user", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
      data
    });
  }
);

//-----------------------------------------------------------------------------------------------
// post requests for information
//User
router.post('/dashboard/admin/create-user', async (req, res) => {
    await RegisterUser("user", req, res)
    res.redirect('/login-user')
});

// router
// .post('/login-user', async (req, res) => {
//     await webLoginUser("user", req, res);
//     //res.redirect('/dashboard/user')
// });

// vendor
// router
// .post('/register-vendor', async (req, res) => {
//     await RegisterUser("vendor", req, res)
//     res.redirect('/login-vendor')
// });

// router
// .post('/login-vendor', async (req, res) => {
//     await webLoginUser("vendor", req, res);
 //res.redirect('/dashboard/vendor')
// });

//admin
router.post("/register-admin", async (req, res, next) => {
  await RegisterAdmin(req, res, next);
  //res.redirect('login-admin')
});

router.post("/login-admin", async (req, res, next) => {
  await webLoginAdmin(req, res, next);
  //res.redirect('/dashboard/admin')
});

router.get(
  "/dashboard/admin/change-password",
  userAuth,
  checkRole(["admin"]),
  (req, res) => {
    let name = req.user.fullname.split(" ");
    let email = req.user.email;
    res.render("dashboard/admin/changepassword", {
      user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
      email: email,
    });
  }
);

router.post('/dashboard/admin/change-password', async (req, res) => {
  await changePassword(req, res)
  res.redirect('/login-admin')
});



router.route("/dashboard/profile").get(userAuth, async (req, res) => {
  return res.json(profile(req.user));
});

router.route("/dashboard/profile/update").post(userAuth, updateUser);

router
  .route("/dashboard/profile/upload-pic")
  .post(userAuth, multer.single("image"), uploadPicture);

router
  .route("/dashboard/profile/update-pic")
  .patch(userAuth, multer.single("image"), updatePicture);

router.route("/dashboard/profile/delete-pic").delete(userAuth, deletePicture);

router.route("/dashboard/profile/get-pic/").get(userAuth, getPicture);

// router
// .route('/get-unverified-vendor')
// .get(userAuth, checkRole(["admin"]), getUnverifieds)

// router
// .route('/get-vendors')
// .get(userAuth, checkRole(["admin"]), getVendors)

// router
// .route('/get-vendorsByservice')
// .get(userAuth, checkRole(["admin"]), getVendorsByServices)

// router
//   .route("/verification")
//   .post(userAuth, checkRole(["admin"]), verification);

router.route("/email-verification").post(emailVerification_V1);

router.route("/email-verification").get(emailVerification_V2);
//------------------------------------------Forgot Password-------------------------------
router.route("/forgot-password").get((req, res) => {
  res.render("base/forgot");
});

router.route("/forgot-password").post(checkEmail);

router.route("/reset-password/:id/:token").get(forgotPassword);

router.route("/change-password").post(userAuth, changePassword);

//----------------------------------------------------------------------------------------

router
  .route("/create-cinema-post")
  .post(
    userAuth,
    checkRole(["admin"]),
    upload.array("image"),
    createCinemaService
  );

router
  .route("/create-hotel-post")
  .post(
    userAuth,
    checkRole(["admin"]),
    upload.array("image"),
    createHotelService
  );

router
  .route("/create-food-post")
  .post(
    userAuth,
    checkRole(["admin"]),
    upload.array("image"),
    createFoodService
  );

router
  .route("/create-studio-post")
  .post(
    userAuth,
    checkRole(["admin"]),
    upload.array("image"),
    createStudioService
  );

router
  .route("/create-gaming-post")
  .post(
    userAuth,
    checkRole(["admin"]),
    upload.array("image"),
    createGamingService
  );

router
  .route("/create-rent-post")
  .post(
    userAuth,
    checkRole(["admin"]),
    upload.array("image"),
    createRentService
  );

router.route("/get-cinema-posts").get(userAuth, getCinemaServices);

router.route("/get-hotel-posts").get(userAuth, getHotelServices);

router.route("/get-studio-posts").get(userAuth, getStudioServices);

router.route("/get-food-posts").get(userAuth, getFoodServices);

router.route("/get-gaming-posts").get(userAuth, getGamingServices);

router.route("/get-rent-posts").get(userAuth, getRentServices);

router.route("/get-cinema-bytitle").post(userAuth, getCinemaByTitle);

router.route("/get-hotel-bytitle").post(userAuth, getHotelByTitle);

router.route("/get-studio-bytitle").post(userAuth, getStudioByTitle);

router.route("/get-food-bytitle").post(userAuth, getFoodByTitle);

router.route("/get-gaming-bytitle").post(userAuth, getGamingByTitle);

router.route("/get-rent-bytitle").post(userAuth, getRentByTitle);


router
  .route("/update-cinema-byuser")
  .patch(userAuth, checkRole(["admin"]), upload.array("image"), updateCinema);

router
  .route("/update-hotel-byuser")
  .patch(userAuth, checkRole(["admin"]), upload.array("image"), updateHotel);

router
  .route("/update-studio-byuser")
  .patch(userAuth, checkRole(["admin"]), upload.array("image"), updateStudio);

router
  .route("/update-gaming-byuser")
  .patch(userAuth, checkRole(["admin"]), upload.array("image"), updateGaming);

router
  .route("/update-food-byuser")
  .patch(userAuth, checkRole(["admin"]), upload.array("image"), updateFood);

router
  .route("/update-rent-byuser")
  .patch(userAuth, checkRole(["admin"]), upload.array("image"), updateRent);


//------------------------------------Upload Service Images-------------------------------

  router.post("/addcinemaimage/:cinemaId", userAuth, checkRole(["admin"]), upload.array("image"), uploadCinemaImage)

  router.post("/addfoodimage/:foodId", userAuth, checkRole(["admin"]), upload.array("image"), uploadFoodImage)

  router.post("/addhotelimage/:hotelId", userAuth, checkRole(["admin"]), upload.array("image"), uploadHotelImage)

  router.post("/addrentimage/:rentId", userAuth, checkRole(["admin"]), upload.array("image"), uploadRentImage)

  router.post("/addstudioimage/:studioId", userAuth, checkRole(["admin"]), upload.array("image"), uploadStudioImage)

  router.post("/addgameimage/:gameId", userAuth, checkRole(["admin"]), upload.array("image"), uploadGameImage)

//----------------------------------------------------------------------------------------

//---------------------------------------Remove Service Image-----------------------------
router.delete("/deletecinemaimage/:imageId", userAuth, checkRole(["admin"]), RemoveCinemaImage)

router.delete("/deletefoodimage/:imageId", userAuth, checkRole(["admin"]), RemoveFoodImage)

router.delete("/deletehotelimage/:imageId", userAuth, checkRole(["admin"]), RemoveHotelImage)

router.delete("/deleterentimage/:imageId", userAuth, checkRole(["admin"]), RemoveRentImage)

router.delete("/deletestudioimage/:imageId", userAuth, checkRole(["admin"]), RemoveStudioImage)

router.delete("/deletegameimage/:imageId", userAuth, checkRole(["admin"]), RemoveGameImage)
//----------------------------------------------------------------------------------------

//---------------------------------Ads--------------------------------------------
router.post("/createAds", userAuth, upload.single("image"), createAds);
router.put("/updateAds/:id", userAuth, upload.single("image"), updateAds);
router.get("/getAllAds", userAuth, getAllAds);
router.get("/getAdsById/:id", userAuth, getAdById);
router.delete("/deleteAds/:id", userAuth, deleteAds);
//---------------------------------------------------------------------------------
//-----------------------Food Order---------------------------------------
router.get("/getOrders", userAuth, viewAdminOrder );
router.get("/getOrder/:orderId", userAuth, viewOrder );
//----------------------------------------------------------------

//--------------------------Hotel Bookings------------------------
router.get("/getAllBookings", userAuth, getbookings);
router.get("/getBooking/:bookingId", userAuth, getbooking)

//----------------------------Rent Bookings----------------------------
router.get("/getAllRentBookings", userAuth, getRentbookings);
router.get("/getRentBooking/:bookingId", userAuth, getRentbooking)

router
.get('/VerifyPay/hotel', hotelverify)
router.get("/VerifyPay/food", Checkout)
router.get("/VerifyPay/rent", rentVerify)

router.get("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }req.session.destroy();
    res.clearCookie("jwt");
    res.redirect("/");
  });
});


// router
// .get('/pay/verify', userAuth, verify)

module.exports = router;
