const Product = require('../../model/product');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');

exports.createGamingService = async(req, res) => {
    const { title, description, genre, price, age_rate,} = req.body;
    try {
        if(req.user.verified === true){
            const result = await cloudinary.uploader.upload(req.file.path);
            const game = new Product({
                user_id: req.user.id,
                title,
                description,
                genre,
                price: parseFloat(price),
                age_rate,
                productType: 'game',
                img_id: result.public_id,
                img_url: result.secure_url
            })
            await game.save();
            res.status(201).json({
                status: true,
                message: "Posted successfully",
                data: game
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


exports.getGamingServices = async(req, res) => {
    try {
        const game = await Product.findAll({where: {
            productType: 'game'
        }});
        if(game){
            res.status(200).json({
                status: true,
                data: game
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

exports.getGamingForUser = async(req, res) => {
    try {
        const game = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'game'
        }}, {include: User})
        if(game){
            res.status(200).json({
                status: true,
                data: game
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

exports.getGamingByTitle = async(req, res) => {
    const title= req.body;
    try {
        const game = await Product.findAll({where: {
            title: title,
            productType: 'game'
        }}, {include: User})
        if(game){
            res.status(200).json({
                status: true,
                data: game})
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

exports.updateGaming = async(req, res) => {
    const { title, description, genre, price, age_rate,} = req.body;
    try{
        if(req.file.path) {
            const result = await cloudinary.uploader.upload(req.file.path);
             await Product.update({
                title: title,
                description: description,
                genre: genre,
                price: parseFloat(price),
                age_rate: age_rate,
                img_id: result.public_id,
                img_url: result.secure_url
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'game'
            }})
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        } else{
            await Product.update({
                title: title,
                description: description,
                genre: genre,
                price: parseFloat(price),
                age_rate: age_rate,
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'game'
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