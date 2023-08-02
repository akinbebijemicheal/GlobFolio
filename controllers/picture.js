//const User = require('../model/user')
const Picture = require("../model/profilepic");
const cloudinary = require("../util/cloudinary");
const User = require("../model/user");
const Subscription = require("../model/Subscription");

exports.uploadPicture = async (req, res) => {
  try {
    let picture = await Picture.findOne({
      where: {
        userid: req.user.id,
      },
    });
    if (picture) {
      res.status(302).json({
        success: false,
        message: "Picture uploaded already",
      });
    } else {
      const result = await cloudinary.cloudinary.uploader.upload(req.file.path);
      picture = new Picture({
        userid: req.user.id,
        content_id: result.public_id,
        secure_url: result.secure_url,
      });

      await picture.save();

      res.status(201).json({
        success: true,
        message: "Profile picture uploaded",
        data: {
          img_url: result.secure_url,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};

exports.getPicture = async (req, res) => {
  try {
    const picture = await Picture.findOne({
      where: {
        userid: req.user.id,
      },
    });
    res.status(200).json({
      success: true,
      data: {
        content_id: picture.content_id,
        img_url: picture.secure_url,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};

exports.deletePicture = async (req, res) => {
  try {
    const picture = await Picture.findOne({
      where: {
        userid: req.user.id,
      },
    });
    await cloudinary.cloudinary.uploader.destroy(picture.content_id);
    await Picture.destroy({ where: { userid: req.user.id } });
    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};

exports.updatePicture = async (req, res) => {
  try {
    const picture = await Picture.findOne({
      where: {
        userid: req.user.id,
      },
    });
    console.log(picture);
    if (picture) {
      await cloudinary.cloudinary.uploader.destroy(picture.content_id);
      await Picture.destroy({ where: { userid: req.user.id } });
      var result = await cloudinary.cloudinary.uploader.upload(req.file.path);
      const savedresult = new Picture({
        userid: req.user.id,
        content_id: result.public_id,
        secure_url: result.secure_url,
      });
      await savedresult.save();
    } else {
      var result = await cloudinary.cloudinary.uploader.upload(req.file.path);
      const savedresult = new Picture({
        userid: req.user.id,
        content_id: result.public_id,
        secure_url: result.secure_url,
      });
      await savedresult.save();
    }

    let user = await User.findOne({
      where: {
        id: req.user.id,
      },
      include: [
        {
          model: Picture,
        },
        {
          model: Subscription,
          as: "subscription",
        },
      ],
    });

    
    let output = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      userType: user.userType,
      phone_no: user.phone_no,
      country: user.country,
      gender: user.gender,
      email_verify: user.email_verify,
      referralId: user.referralId,
      createdAt: user.createdAt,
      picture: user.picture,
      Subscription: user.subscription,
    };

    res.status(201).json({
      success: true,
      message: "Picture Updated successfully",
      data: output,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occured",
      error: error,
    });
  }
};
