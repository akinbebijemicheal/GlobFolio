const Product = require('../../model/hotel');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');

exports.createHotelService = async(req, res) => {
    const { title, description, location, rating, price } = req.body;
    try {
        if(req.user.verified === true){
            const uploader = async (path) => await cloudinary.uploads(path, 'Images');
            //console.log(path)
            
                const urls = [];
                const ids = []
                const files = req.files;
                for (const file of files){
                    const { path } = file;
                    const newPath = await uploader(path)
                    urls.push(newPath.url);
                    ids.push(newPath.id)
                    fs.unlinkSync(path)
                }

            const hotel = new Product({
                userid: req.user.id,
                title,
                description,
                location,
                rating: parseFloat(rating),
                price: price,
                productType: 'hotel',
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            })
            const hotelout = await hotel.save();

            hotelout.img_id = JSON.parse(hotelout.img_id);
            hotelout.img_url = JSON.parse(hotelout.img_url)
            res.status(201).json(hotelout)
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


exports.getHotelServices = async(req, res) => {
    try {
        const length = req.query.length
        const hotel = await Product.findAll({where: {
            productType: 'hotel'
        },  order: [
            ['rating', 'ASC']
        ]});
        hotel.img_id = JSON.parse(hotel.img_id);
        hotel.img_url = JSON.parse(hotel.img_url)
        if(hotel){
            if(hotel.length <= length || length === ""){
                res.status(200).json({
                    status: true,
                    data: hotel
                });
            }else{
                let begin = length - 10;
                let end = length + 1
                var sliced = hotel.slice(begin, end)
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

exports.getHotelForUser = async(req, res) => {
    try {
        const hotel = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'hotel'
        }, include:[
            {
                model: User
            }
        ]})
        hotel.img_id = JSON.parse(hotel.img_id);
        hotel.img_url = JSON.parse(hotel.img_url)
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
        }, include:[
            {
                model: User
            }
        ]})
        hotel.img_id = JSON.parse(hotel.img_id);
        hotel.img_url = JSON.parse(hotel.img_url)
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

exports.getHotelById = async(req, res) => {
    const id= req.parmas.id;
    try {
        const hotel = await Product.findAll({where: {
            id: id,
            productType: 'hotel'
        }, include:[
            {
                model: User
            }
        ]})
        hotel.img_id = JSON.parse(hotel.img_id);
        hotel.img_url = JSON.parse(hotel.img_url)
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
        if(req.file || req.files) {
            const uploader = async (path) => await cloudinary.uploads(path, 'Images');
            //console.log(path)
            
                const urls = [];
                const ids = []
                const files = req.files;
                for (const file of files){
                    const { path } = file;
                    const newPath = await uploader(path)
                    urls.push(newPath.url);
                    ids.push(newPath.id)
                    fs.unlinkSync(path)
                }
             await Product.update({
                title: title,
                description: description,
                location: location,
                rating: parseFloat(rating),
                price: price,
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
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
                price: price,
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