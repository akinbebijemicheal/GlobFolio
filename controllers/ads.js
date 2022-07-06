const Ads = require("../model/ads");
const User = require("../model/user");
const cloudinary = require("../util/cloudinary").cloudinary;

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
        res.status(403).json({
          message: "Ads with that title and link alread exists",
        });
      } else {
        const result = await cloudinary.uploader.upload(req.file.path);
        const ad = new Ads({
          title,
          ref_link,
          userId: req.user.id,
          img_id: result.public_id,
          img_url: result.secure_url,
        });
        await ad.save();

        const adres = await Ads.findOne({
          where: {
            title: title,
            ref_link: ref_link,
            userId: req.user.id,
          },
          include: [
            {
              model: User,
              attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt"],
              },
            },
          ],
        });

        res.status(201).json({
          status: true,
          message: "Ads Created Successfully",
          data: adres,
        });
      }
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getAllAdsbyUser = async (req, res, next) => {
  try {
    await Ads.findAll({
      where: {
        userId: req.user.id,
      },
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

exports.getAdbyUser = async (req, res, next) => {
  try {
    await Ads.findAll({
      where: {
        userId: req.user.id,
        id: req.params.id,
      },
    }).then((ad) => {
      if (ad) {
        res.status(200).json({
          status: true,
          data: ad,
        });
      } else {
        res.status(404).json({
          status: false,
          message: "Ad Not found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getAllAds = async (req, res, next) => {
  try {
    await Ads.findAll().then((ads) => {
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


