const Product = require('../../model/product');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');

exports.createStudioService = async(req, res) => {
    const { title, description, location, per_time, price, rating, equipment } = req.body;
    try {
        if(req.user.verified === true){
            const result = await cloudinary.uploader.upload(req.file.path);
            const studio = new Product({
                user_id: req.user.id,
                title,
                description,
                location,
                per_time,
                rating: parseFloat(rating),
                price: parseFloat(price),
                equipment,
                productType: 'studio',
                img_id: result.public_id,
                img_url: result.secure_url
            })
            await studio.save();
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


exports.getStudioServices = async(req, res) => {
    try {
        const studio = await Product.findAll({where: {
            productType: 'studio'
        }});
        if(studio){
            res.status(200).json({
                status: true,
                data: studio
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

exports.getStudioForUser = async(req, res) => {
    try {
        const studio = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'studio'
        }}, {include: User})
        if(studio){
            res.status(200).json({
                status: true,
                data: studio
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

exports.getStudioByTitle = async(req, res) => {
    const title= req.body;
    try {
        const studio = await Product.findAll({where: {
            title: title,
            productType: 'studio'
        }}, {include: User})
        if(studio){
            res.status(200).json({
                status: true,
                data: studio})
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

exports.updateStudio = async(req, res) => {
    const { title, description, location, per_time, price, rating, equipment } = req.body;
    try{
        if(req.file.path) {
            const result = await cloudinary.uploader.upload(req.file.path);
             await Product.update({
                title: title,
                description: description,
                location: location,
                per_time: per_time,
                rating: parseFloat(rating),
                price: parseFloat(price),
                equipment: equipment,
                img_id: result.public_id,
                img_url: result.secure_url
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'studio'
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
                per_time: per_time,
                rating: parseFloat(rating),
                price: parseFloat(price),
                equipment: equipment,
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'studio'
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