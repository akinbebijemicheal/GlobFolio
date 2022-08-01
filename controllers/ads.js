const Ads = require("../model/ads");
const User = require("../model/user");
const cloudinary = require("../util/cloudinary").cloudinary;
const store = require('store')


exports.createAds = async (req, res, next) => {
  const { title, ref_link } = req.body;
  try {
    await Ads.findOne({
      where: {
        title: title,
        ref_link: ref_link,
      },
    }).then(async (ads) => {
      if (ads) {
                  req.flash("warning", 'Ads with Title and Link Already exist');
        res.redirect("/dashboard/admin/createAds")


      } else {
        const result = await cloudinary.uploader.upload(req.file.path);
        const ad = new Ads({
          title,
          ref_link,
          img_id: result.public_id,
          img_url: result.secure_url,
        });
        var out = await ad.save();

        const adres = await Ads.findOne({
          where: {
            id: out.id
          }
        });

        res.redirect("/dashboard/admin/getAllAds")
        
      }
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};


exports.getAllAds = async (req, res, next) => {
  try {
    await Ads.findAll({
      order: [
        ['createdAt', 'ASC']
    ],
    }).then((ads) => {
      if (ads) {
        console.log("Ads found")
        store.set("Ad", JSON.stringify(ads));
              let name = req.user.fullname.split(" ");
              let email = req.user.email;
              data = JSON.parse(store.get("Ad"));
              console.log(data)
              res.render("dashboard/admin/getAllAds", {
                user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                email: email,
                data
              });
              next();
      } else {
        console.log("No Ads found")
                store.set("Ad", JSON.stringify(ads));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("Ad"));
                      console.log(data)
                      res.render("dashboard/admin/getAllAds", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data
                      });
                      next();
      }
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getAppAllAds = async (req, res, next) => {
  try {
    await Ads.findAll({
      order: [
        ['createdAt', 'ASC']
    ],
    }).then((ads) => {
      if (ads) {
        res.status(200).json({
          status: true,
          data: ads,
        });
      } else {
        res.status(404).json({
          status: false,
          message: "No ads found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getAdById = async (req, res, next) => {
  try {
    await Ads.findOne({
      id: req.params.id
    }).then((ads) => {
      if (ads) {
        res.status(200).json({
          status: true,
          data: ads,
        });
      } else {
        res.status(404).json({
          status: false,
          message: "No ad found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.updateAds = async (req, res, next) => {
  //const {title, ref_link} = req.body
  try {
    await Ads.findOne({
      where: {
        id: req.params.id,
      },
    }).then(async (ad) => {
      if (ad) {
        if (req.body) {
          if (req.file) {
            await Ads.update(req.body, {
              where: {
                id: ad.id,
              },
            });
            await cloudinary.uploader.destroy(ad.img_id);
            const result = await cloudinary.uploader.upload(req.file.path);
            await Ads.update(
              {
                img_id: result.public_id,
                img_url: result.secure_url,
              },
              {
                where: {
                  id: ad.id,
                },
              }
            );
          } else {
            await Ads.update(req.body, {
              where: {
                id: ad.id,
              },
            });
          }
        } else {
          if (req.file) {
            await cloudinary.uploader.destroy(ad.img_id);
            const result = await cloudinary.uploader.upload(req.file.path);
            await Ads.update(
              {
                img_id: result.public_id,
                img_url: result.secure_url,
              },
              {
                where: {
                  id: ad.id,
                },
              }
            );
          } else {
            res.status(404).json({
              status: false,
              message: "Nothing to update",
            });
          }
        }
        const adsres = await Ads.findOne({
          where: {
            id: req.params.id,
          },
        });
        res.status(200).json({
          status: true,
          data: adsres,
        });
      } else {
        res.status(404).json({
          status: false,
          message: "Ad not found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.deleteAds = async (req, res, next) => {
  //const {title, ref_link} = req.body
  try {
    await Ads.findOne({
      where: {
        id: req.params.id,
      },
    }).then(async (ad) => {
      if (ad) {
        await cloudinary.uploader.destroy(ad.img_id);
        await Ads.destroy({
          where: {
            id: ad.id,
          },
        });
        res.status(200).json({
          status: true,
          message: "Ads Deleted successfully",
        });
      } else {
        res.status(404).json({
          status: false,
          message: "Ad not found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};


