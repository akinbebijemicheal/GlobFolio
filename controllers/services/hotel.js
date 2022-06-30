const Product = require('../../model/hotel');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const Amenity = require('../../model/amenities');
const Extras = require('../../model/hotelextras')
const fs = require('fs')

exports.createHotelService = async(req, res) => {
    const { title, description, location, rating} = req.body;
    try {
            const uploader = async (path) => await cloudinary.uploads(path, 'Images');
            
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
                console.log(amenities)
               var amenitiesOut = await Amenity.bulkCreate(amenities, {returning: true})
            }

            if(req.body.room && req.body.price){
                
                const room_price = (room, price)=>{
                    var output = []
                    for(let i = 0; i<room.length; i++){
                        output.push({
                            hotelId: hotelout.id,
                            room: room[i],
                            price: price[i]
                        }); 
                    };
                    return output;
                }
                console.log(room_price(req.body.room, req.body.price));
                var extras = await Extras.bulkCreate(room_price(req.body.room, req.body.price), {returning: true})
            }
            
            res.status(201).json({
                status: true,
                hotel: hotelout,
                amenities: amenitiesOut,
                Extras: extras

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


exports.getHotelServices = async(req, res) => {
    try {
        const length = req.query.length;
        var hotel = await Product.findAll({
        order: [
            ['rating', 'ASC']
        ], include:[
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

// exports.getHotelForUser = async(req, res) => {
//     try {
//         var hotel = await Product.findAll({ where: {
//             userid: req.user.id,
//             productType: 'hotel'
//         }, include:[
//             {
//                 model: User,
//                 attributes: {
//                     exclude: ["createdAt", "updatedAt"]
//                 }
//             },
//             {
//                 model: Amenity,
//                 attributes: {
//                     exclude: ["createdAt", "updatedAt"]
//                 }
//             },
//             {
//                 model: Extras,
//                 attributes: {
//                     exclude: ["createdAt", "updatedAt"]
//                 }
//             }
//         ]})
        
//         if(hotel){
//             for(let i=0; i<hotel.length; i++){
//                 hotel[i].img_id = JSON.parse(hotel[i].img_id);
//                 hotel[i].img_url = JSON.parse(hotel[i].img_url);
//                 // hotel[i].amenities = JSON.parse(hotel[i].amenities);
//                 // hotel[i].room_pricing = JSON.parse(hotel[i].room_pricing);
//             }
//             res.status(200).json({
//                 status: true,
//                 data: hotel
//             });
//         } else{
//             res.status(404).json({
//                 status: false,
//                 message: "Post not Found"
//             })
//         }
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({
//              status: false,
//              message: "An error occured",
//              error: error
//          })
//     }
// }

exports.getHotelByTitle = async(req, res) => {
    const {title}= req.body;
    try {
        var hotel = await Product.findAll({where: {
            title: title,
        }, include:[
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
        var hotel = await Product.findOne({where: {
            id: id,
        }, include:[
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
    const { title, description, location, rating } = req.body;
    try{
        if(req.file || req.files) {
            const uploader = async (path) => await cloudinary.uploads(path, 'Images');
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
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            }, { where: {
                id: req.params.id
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
            }, { where: {
                id: req.params.id
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

