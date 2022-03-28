//const User = require('../model/user')
const Picture = require('../model/profilepic')
const cloudinary = require('../util/cloudinary');


exports.uploadPicture = async(req, res) => {
    
    try {
       
        let picture = await Picture.findOne({ where: {
            userid: req.user.id
        }});
        if(picture){
            res.status(302).json({
                msg: "picture uploaded already"
            })
        } else{
            const result = await cloudinary.uploader.upload(req.file.path);
            picture = new Picture({
            userid: req.user.id,
            content_id: result.public_id,
            secure_url: result.secure_url
        });

        await picture.save();

        res.status(201).json({
            msg:"Profile picture uploaded",
            url: result.secure_url
        })
        
        }
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "error occured",
             error
         })
    }
}

exports.getPicture = async(req, res) => {
    try {
        const picture = await Picture.findOne({ where: {
            userid: req.user.id
        }})
        res.status(200).json({
            content_id: picture.content_id,
            url: picture.secure_url
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "error occured",
             error
         })
    }
}

exports.deletePicture = async(req, res) => {
    try {
        const picture = await Picture.findOne({ where: {
            userid: req.user.id
        }})
        await cloudinary.uploader.destroy(picture.content_id);
        await Picture.destroy({where: {userid: req.user.id}})
        res.status(200).json({
            msg: "Deleted successfully"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "error occured",
             error
         })
    }
};

exports.updatePicture = async(req, res) => {
   
   try {
       
        let picture = await Picture.findOne({ where: {
            userid: req.user.id
        }})
        await cloudinary.uploader.destroy(picture.content_id);
        
        const result = await cloudinary.uploader.upload(req.file.path);
        await Picture.update({
            content_id: result.public_id,
            secure_url: result.secure_url,
        }, {where: {
            userid: req.user.id
        }});

        res.status(200).json({
            msg: "Picture Updated successfully"
        })
   } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "error occured",
            error
        }) 
   }

}


