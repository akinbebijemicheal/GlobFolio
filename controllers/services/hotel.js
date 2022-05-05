const Product = require('../../model/hotel');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const Amenity = require('../../model/amenities');
const Extras = require('../../model/hotelextras')
const fs = require('fs')

exports.createHotelService = async(req, res) => {
    const { title, description, location, rating} = req.body;
    // var amenities = {
    //     amenity1: amenity1,
    //     amenity2: amenity2,
    //     amenity3: amenity3,
    //     amenity4: amenity4,
    //     amenity5: amenity5
    // };

    // var room_pricing = [
    //     {   room1: room1, 
    //         price1: price1
    //     }, 
    //     { room2: room2, 
    //         price2: price2
    //     }, 
    //     {   room3: room3,
    //         price3: price3
    //     }, 
    //         {room4: room4,
    //         price4: price4
    //     }, 
    //     {   room5: room5, 
    //         price5: price5
    //     }
    // ]
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
                // price: price,
                // amenities: JSON.stringify(amenities),
                // room_pricing: JSON.stringify(room_pricing),
                productType: 'hotel',
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            })
            const hotelout = await hotel.save();

            hotelout.img_id = JSON.parse(hotelout.img_id);
            hotelout.img_url = JSON.parse(hotelout.img_url);

            if(req.body.amenities){
                const amenities = req.body.amenities.map((amenity) => {
                    return {
                        hotelId: hotelout.id,
                        amenities: amenity
                    }
                })
               var amenitiesOut = await Amenity.bulkCreate(amenities)
            }

            if(req.body.room && req.body.price){
                const rooms = req.body.room.map((room) => {
                    return req.body.price.map((price) => {
                        return {
                            hotelId: hotelout.id,
                            room: room,
                            price: price
                        }
                    })
                })
                var extras = await Extras.bulkCreate(rooms)
            }
            // hotelout.amenities = JSON.parse(hotelout.amenities)
            // hotelout.room_pricing = JSON.parse(hotelout.room_pricing)
            
            res.status(201).json({
                status: true,
                hotel: hotelout,
                amenities: amenitiesOut,
                Extras: extras

            })
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
        var hotel = await Product.findAll({where: {
            productType: 'hotel'
        },  order: [
            ['rating', 'ASC']
        ], include:[
            {
                model: User,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Amenity,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Extras,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            }
        ]});

        if(hotel){
            for(let i=0; i<hotel.length; i++){
                hotel[i].img_id = JSON.parse(hotel[i].img_id);
                hotel[i].img_url = JSON.parse(hotel[i].img_url);
                // hotel[i].amenities = JSON.parse(hotel[i].amenities);
                // hotel[i].room_pricing = JSON.parse(hotel[i].room_pricing);
            }
            if(hotel.length <= length || length === "" || !length){
                
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
        var hotel = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'hotel'
        }, include:[
            {
                model: User,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Amenity,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Extras,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            }
        ]})
        
        if(hotel){
            for(let i=0; i<hotel.length; i++){
                hotel[i].img_id = JSON.parse(hotel[i].img_id);
                hotel[i].img_url = JSON.parse(hotel[i].img_url);
                // hotel[i].amenities = JSON.parse(hotel[i].amenities);
                // hotel[i].room_pricing = JSON.parse(hotel[i].room_pricing);
            }
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
    const {title}= req.body;
    try {
        var hotel = await Product.findAll({where: {
            title: title,
            productType: 'hotel'
        }, include:[
            {
                model: User,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Amenity,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Extras,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            }
        ]})
        
        if(hotel){
            for(let i=0; i<hotel.length; i++){
                hotel[i].img_id = JSON.parse(hotel[i].img_id);
                hotel[i].img_url = JSON.parse(hotel[i].img_url);
                // hotel[i].amenities = JSON.parse(hotel[i].amenities);
                // hotel[i].room_pricing = JSON.parse(hotel[i].room_pricing);
            }
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
    const id= req.params.id;
    try {
        var hotel = await Product.findAll({where: {
            id: id,
            productType: 'hotel'
        }, include:[
            {
                model: User,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Amenity,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Extras,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            }
        ]})
        
        if(hotel){
            for(let i=0; i<hotel.length; i++){
                hotel[i].img_id = JSON.parse(hotel[i].img_id);
                hotel[i].img_url = JSON.parse(hotel[i].img_url);
                // hotel[i].amenities = JSON.parse(hotel[i].amenities);
                // hotel[i].room_pricing = JSON.parse(hotel[i].room_pricing);
            }
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
    const { title, description, location, ratin } = req.body;
    // var amenities = {
    //     amenity1: amenity1,
    //     amenity2: amenity2,
    //     amenity3: amenity3,
    //     amenity4: amenity4,
    //     amenity5: amenity5
    // };

    // var room_pricing = [
    //     {   room1: room1, 
    //         price1: price1
    //     }, 
    //     { room2: room2, 
    //         price2: price2
    //     }, 
    //     {   room3: room3,
    //         price3: price3
    //     }, 
    //         {room4: room4,
    //         price4: price4
    //     }, 
    //     {   room5: room5, 
    //         price5: price5
    //     }
    // ]
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
                // price: price,
                // amenities: JSON.stringify(amenities),
                // room_pricing: JSON.stringify(room_pricing),
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
                // price: price,
                // amenities: JSON.stringify(amenities),
                // room_pricing: JSON.stringify(room_pricing),
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