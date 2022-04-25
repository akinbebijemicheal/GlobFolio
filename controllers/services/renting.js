const Product = require('../../model/product');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');

exports.createRentService = async(req, res) => {
    const { title, description, location, per_time, price } = req.body;
    try {
        if(req.user.verified === true){
            const result = await cloudinary.uploader.upload(req.file.path);
            const rent = new Product({
                user_id: req.user.id,
                title,
                description,
                location,
                per_time,
                price: price,
                productType: 'rent',
                img_id: result.public_id,
                img_url: result.secure_url
            })
            const rentout = await rent.save();

            res.status(201).json(rentout)
            // await Product.findOne({where: {
            //     title: title
            // }}).then(async(product) => {
            //     var link = `${process.env.BASE_URL}/add-to-cart/${product.id}`
            //     await Product.update({link: link}, {where: {
            //         id: product.id
            //     }})
    
            //     await Product.findOne({where: {
            //         id: product.id
            //     }}).then((product) => {
            //         res.status(201).json({
            //             status: true,
            //             message: "Posted successfully",
            //             data: product
            //         })
            //     })
                
            // })
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


exports.getRentServices = async(req, res) => {
    try {
        const length = req. query.length;
        const rent = await Product.findAll({where: {
            productType: 'rent'
        }});
        if(rent){
            if(rent.length <= length || length === ""){
                res.status(200).json({
                    status: true,
                    data: rent
                });
            }else{
                let begin = length - 10;
                let end = length + 1
                var sliced = rent.slice(begin, end)
                res.status(200).json({
                    status: true,
                    data: sliced
                });
            }
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

exports.getRentForUser = async(req, res) => {
    try {
        const rent = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'rent'
        }}, {include: User})
        if(rent){
            res.status(200).json({
                status: true,
                data: rent
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

exports.getRentByTitle = async(req, res) => {
    const title= req.body;
    try {
        const rent = await Product.findAll({where: {
            title: title,
            productType: 'rent'
        }}, {include: User})
        if(rent){
            res.status(200).json({
                status: true,
                data: rent})
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

exports.getRentById = async(req, res) => {
    const id= req.parmas.id;
    try {
        const rent = await Product.findAll({where: {
            id: id,
            productType: 'rent'
        }}, {include: User})
        if(rent){
            res.status(200).json({
                status: true,
                data: rent})
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

exports.updateRent = async(req, res) => {
    const { title, description, location, per_time, price } = req.body;
    try{
        if(req.file.path) {
            const result = await cloudinary.uploader.upload(req.file.path);
             await Product.update({
                title: title,
                description: description,
                location: location,
                per_time: per_time,
                price: price,
                img_id: result.public_id,
                img_url: result.secure_url
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'rent'
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
                price: price,
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'rent'
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