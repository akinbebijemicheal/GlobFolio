const cloudinary = require('cloudinary').v2;
const cloudinary1 = require('cloudinary')

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

cloudinary1.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploads = (file, folder) => {
    return new Promise(resolve => {
        cloudinary1.uploader.upload(file, (result) =>{
            resolve({
                url: result.secure_url,
                id: result.public_id
            })
        }, {
            resource_type: "auto",
            folder: folder
        })
    })
}

module.exports = {
    cloudinary,
    uploads
}
