const Product = require('../../model/product');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');

exports.createCinemaService = async(req, res) => {
    const { title, genre, storyline, rating, cast, duration, age_rate,  price } = req.body;
    try {
        if(req.user.verified === true){
            const result = await cloudinary.uploader.upload(req.file.path);
        const cinema = new Product({
            user_id: req.user.id,
            title,
            genre,
            storyline,
            cast,
            duration,
            age_rate,
            rating: parseFloat(rating),
            price: parseFloat(price),
            productType: 'cinema',
            img_id: result.public_id,
            img_url: result.secure_url
        })
        await cinema.save();

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


exports.getCinemaServices = async(req, res) => {
    try {
        const cinema = await Product.findAll({where: {
            productType: 'cinema'
        }});
        if(cinema){
            res.status(200).json({
                status: true,
                data: cinema
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

exports.getCinemaForUser = async(req, res) => {
    try {
        const cinema = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'cinema'
        }}, {include: User})
        if(cinema){
            res.status(200).json({
                status: true,
                data: cinema
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

exports.getCinemaByTitle = async(req, res) => {
    const title= req.body;
    try {
        const cinema = await Product.findAll({where: {
            title: title,
            productType: 'cinema'
        }}, {include: User})
        if(cinema){
            res.status(200).json({
                status: true,
                data: cinema})
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

exports.updateCinema = async(req, res) => {
    const { title, genre, storyline, rating, cast, duration, age_rate,  price } = req.body;
    try{
        if(req.file.path) {
            const result = await cloudinary.uploader.upload(req.file.path);
             await Product.update({
                title: title,
                genre: genre,
                storyline: storyline,
                cast: cast,
                duration: duration,
                age_rate: age_rate,
                rating: parseFloat(rating),
                price: parseFloat(price),
                img_id: result.public_id,
                img_url: result.secure_url
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'cinema'
            }})
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        } else{
            await Product.update({
                title: title,
                genre: genre,
                storyline: storyline,
                cast: cast,
                duration: duration,
                age_rate: age_rate,
                rating: parseFloat(rating),
                price: parseFloat(price),
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'cinema'
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