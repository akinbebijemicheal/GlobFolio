const Post = require('../model/post');



exports.createPost = async(req, res) => {
    const { title, serviceType, description} = req.body;
    try {
        const post = new Post({
            title,
            userid: req.user.id,
            serviceType,
            description,
        })
        await post.save();
        res.status(201).json({
            msg: "Posted successfully"
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "An error occured",
             error
         })
    }
}

exports.getPosts = async(req, res) => {
    try {
        const post = await Post.findAll();
        if(post){
            res.status(200).json(post)
        } else{
            res.status(404).json({
                msg: "Posts not Found"
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "An error occured",
             error
         }) 
    }
}

exports.getPostForServices = async(req, res) => {
    const serviceType = req.body;
    try {
        const post = await Post.findAll({where: {serviceType: serviceType}}, {include: User})
        if(post){
            res.status(200).json(post)
        } else{
            res.status(404).json({
                msg: "Post not Found"
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "An error occured",
             error
         }) 
    }
}

exports.getPostForUser = async(req, res) => {
    try {
        const post = await Post.findAll({ where: {userid: req.user.id}}, {include: User})
        if(post){
            res.status(200).json(post)
        } else{
            res.status(404).json({
                msg: "Post not Found"
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "An error occured",
             error
         }) 
    }
}

exports.getPostByTitle = async(req, res) => {
    const title = req.body;
    try {
        const post = await Post.findAll({where: {title: title}}, {include: User})
        if(post){
            res.status(200).json(post)
        } else{
            res.status(404).json({
                msg: "Post not Found"
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "An error occured",
             error
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
                msg: "Post updated"
            })
        } else{
            res.status(404).json({
                msg: "No Post Found"
            })
        }
    } catch{
        console.error(error)
        return res.status(500).json({
             message: "An error occured",
             error
         }) 
    }
}

exports.deletePost = async(req, res) => {
    try {
        
    } catch (error) {
        
    }
}