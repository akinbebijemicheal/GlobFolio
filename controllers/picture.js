//const User = require('../model/user')
const Picture = require('../model/profilepic')
const cloudinary = require('../util/cloudinary');
const User = require('../model/user');


exports.uploadPicture = async(req, res) => {
    
    try {
       
        let picture = await Picture.findOne({ where: {
            userid: req.user.id
        }});
        if(picture){
            res.status(302).json({
                status: false,
                message: "Picture uploaded already"
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
            status: true,
            message: "Profile picture uploaded",
            data: {
               img_url: result.secure_url
            }
        })
        
        }
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "An error occured",
             error: error
         })
    }
}

exports.getPicture = async(req, res) => {
    try {
        const picture = await Picture.findOne({ where: {
            userid: req.user.id
        }})
        res.status(200).json({
            status: true,
            data: {   
                content_id: picture.content_id,
                img_url: picture.secure_url
            }
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "An error occured",
             error: error
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
            status: true,
            message: "Deleted successfully"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "An error occured",
             error: error
         })
    }
};

exports.updatePicture = async(req, res) => {
   
   try {
       
        let picture = await Picture.findOne({ where: {
            userid: req.user.id
        }})
        if(picture){
            await cloudinary.uploader.destroy(picture.content_id);
            const result = await cloudinary.uploader.upload(req.file.path);
            await Picture.update({
                content_id: result.public_id,
                secure_url: result.secure_url,
            }, {where: {
                userid: req.user.id
            }});
        } else{
                const result = await cloudinary.uploader.upload(req.file.path);
                await Picture.create({
                userid: req.user.id,
                content_id: result.public_id,
                secure_url: result.secure_url
            });

            //await picture.save();
        }

        let user = await User.findOne({
            where: {
                id: req.user.id
            }
        })

        let result = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            phone_no: user.phone_no,
            country: user.country,
            serviceType: user.serviceType,
            address: user.address,
            expiresIn: '24 hours',
            verified: user.verified,
            img_url: result.secure_url,
            email_verify: user.email_verify,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt,
        };

        res.status(200).json({
            status: true,
            message: "Picture Updated successfully",
            data: result

        })
   } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: false,
            message: "An error occured",
            error: error
        })
   }

}


