const Product = require('../../model/product');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');

exports.createHotelService = async(req, res) => {
    const { title, description, location, rating, price } = req.body;
    try {
        if(req.user.verified === true){
            const result = await cloudinary.uploader.upload(req.file.path);
            const hotel = new Product({
                user_id: req.user.id,
                title,
                description,
                location,
                rating: parseFloat(rating),
                price: parseFloat(price),
                productType: 'hotel',
                img_id: result.public_id,
                img_url: result.secure_url
            })
            await hotel.save();
            await Product.findOne({where: {
                title: title
            }}).then(async(product) => {
                var link = `${process.env.BASE_URL}/add-to-cart/${product.id}`
                await Product.update({link: link}, {where: {
                    id: product.id
                }})
    
                await Product.findOne({where: {
                    id: product.id
                }}).then((product) => {
                    res.status(201).json({
                        status: true,
                        message: "Posted successfully",
                        data: product
                    })
                })
                
            })
        } else{
            res.status(301).json({
                status: false,
                message: "You are not verified",
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


exports.getHotelServices = async(req, res) => {
    try {
        const hotel = await Product.findAll({where: {
            productType: 'hotel'
        }});
        if(hotel){
            res.status(200).json({
                status: true,
                data: hotel
            });
        } else{
            res.status(404).json({
                status: true,
                message: "Posts not Found"
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

exports.getHotelForUser = async(req, res) => {
    try {
        const hotel = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'hotel'
        }}, {include: User})
        if(hotel){
            res.status(200).json({
                status: true,
                data: hotel
            });
        } else{
            res.status(404).json({
                status: false,
                message: "Post not Found"
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

exports.getHotelByTitle = async(req, res) => {
    const title= req.body;
    try {
        const hotel = await Product.findAll({where: {
            title: title,
            productType: 'hotel'
        }}, {include: User})
        if(hotel){
            res.status(200).json({
                status: true,
                data: hotel})
        } else{
            res.status(404).json({
                status: false,
                message: "Post not Found"
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

exports.updateHotel = async(req, res) => {
    const { title, description, location, rating, price } = req.body;
    try{
        if(req.file.path) {
            const result = await cloudinary.uploader.upload(req.file.path);
             await Product.update({
                title: title,
                description: description,
                location: location,
                rating: parseFloat(rating),
                price: parseFloat(price),
                img_id: result.public_id,
                img_url: result.secure_url
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'hotel'
            }})
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        } else{
            await Product.update({
                title: title,
                description: description,
                location: location,
                rating: parseFloat(rating),
                price: parseFloat(price),
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'hotel'
            }})
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        }   
        
    } catch{
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "An error occured",
             error: error
         })
    }
}