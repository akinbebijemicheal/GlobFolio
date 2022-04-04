const Product = require('../../model/product');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');

exports.createFoodService = async(req, res) => {
    const { title, description, ingredents, price } = req.body;
    try {
        if(req.user.verified === true){
            const result = await cloudinary.uploader.upload(req.file.path);
            const food = new Product({
            user_id: req.user.id,
            title,
            description,
            ingredents,
            price: parseFloat(price),
            productType: 'food',
            img_id: result.public_id,
            img_url: result.secure_url
        })
        await food.save();
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

exports.getFoodServices = async(req, res) => {
    try {
        const food = await Product.findAll({ where: {
            productType: 'food'
        }});
        if(food){
            res.status(200).json({
                status: true,
                data: food
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

exports.getFoodForUser = async(req, res) => {
    try {
        const food = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'food'
        }}, {include: User})
        if(food){
            res.status(200).json({
                status: true,
                data: food
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

exports.getFoodByTitle = async(req, res) => {
    const title = req.body;
    try {
        const food = await Product.findAll({where: {
            title: title,
            productType: 'food'
        }}, {include: User})
        if(food){
            res.status(200).json({
                status: true,
                data: food})
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

exports.updateFood = async(req, res) => {
    const {title, description, ingredents, price } = req.body;
    try{
        if(req.file.path) {
            const result = await cloudinary.uploader.upload(req.file.path);
             await Product.update({
                title: title,
                description: description,
                ingredents: ingredents,
                price: parseFloat(price),
                img_id: result.public_id,
                img_url: result.secure_url
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'food',
            }})
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        } else{
            await Product.update({
                title: title,
                description: description,
                ingredents: ingredents,
                price: parseFloat(price),
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'food'
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