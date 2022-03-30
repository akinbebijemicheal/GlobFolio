const Product = require('../model/product');
const User = require('../model/user')
const cloudinary = require('../util/cloudinary');

exports.createCinemaService = async(req, res) => {
    const { title, genre, storyline, rating, cast, duration, age_rate,  price } = req.body;
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        const cinema = new Product({
            user_id: req.user.id,
            title,
            genre,
            storyline,
            cast,
            duration,
            age_rate,
            rating,
            price,
            productType:
            img_id: result.public_id,
            img_url: result.secure_url
        })
        await cinema.save();
        res.status(201).json({
            status: true,
            message: "Posted successfully",
            data: cinema
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


exports.createPost = async(req, res) => {
    const { title, serviceType, description, price, rate} = req.body;
    try {
        
        const result = await cloudinary.uploader.upload(req.file.path);
        const post = new Post({
            title,
            userid: req.user.id,
            serviceType,
            description,
            price,
            rate,
            img_id: result.public_id,
            img_url: result.secure_url
        })
        await post.save();
        res.status(201).json({
            status: true,
            message: "Posted successfully",
            data: post
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

exports.getPosts = async(req, res) => {
    try {
        const post = await Post.findAll();
        if(post){
            res.status(200).json({
                status: true,
                data: post
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

exports.getPostForServices = async(req, res) => {
    const serviceType = req.body;
    try {
        const post = await Post.findAll({where: {serviceType: serviceType}}, {include: User})
        if(post){
            res.status(200).json({
                status: true,
                data: post
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

exports.getPostForUser = async(req, res) => {
    try {
        const post = await Post.findAll({ where: {userid: req.user.id}}, {include: User})
        if(post){
            res.status(200).json({
                status: true,
                data: post
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

exports.getPostByTitle = async(req, res) => {
    const title = req.body;
    try {
        const post = await Post.findAll({where: {title: title}}, {include: User})
        if(post){
            res.status(200).json({
                status: true,
                data: post})
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

exports.updatePost = async(req, res) => {
    
    try{
        const post = await Post.update(req.body, { where: {
            userid: req.user.id
        }})
        if(post){
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        } else{
            res.status(404).json({
                status: false,
                message: "No Post Found"
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

exports.deletePost = async(req, res) => {
    try {
        
    } catch (error) {
        
    }
}



