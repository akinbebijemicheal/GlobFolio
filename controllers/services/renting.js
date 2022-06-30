const Product = require('../../model/renting');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const fs = require('fs')

exports.createRentService = async(req, res) => {
    const { title, description, location, per_time, price } = req.body;
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
            const rent = new Product({
                title,
                description,
                location,
                per_time,
                price: price,
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            })
            const rentout = await rent.save();
            rentout.img_id = JSON.parse(rentout.img_id);
            rentout.img_url = JSON.parse(rentout.img_url)

            res.status(201).json(rentout);
       
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
        var rent = await Product.findAll({
            order: [
                ['createdAt', 'ASC']
        ]});

        
        if(rent){
            for(let i=0; i<rent.length; i++){
                rent[i].img_id = JSON.parse(rent[i].img_id);
                rent[i].img_url = JSON.parse(rent[i].img_url);
            }
            if(rent.length <= length || length === "" || !length){
                
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

// exports.getRentForUser = async(req, res) => {
//     try {
//         var rent = await Product.findAll({ where: {
//             userid: req.user.id,
//             productType: 'rent'
//         }, include:[
//             {
//                 model: User
//             }
//         ]})

        
//         if(rent){
//             for(let i=0; i<rent.length; i++){
//                 rent[i].img_id = JSON.parse(rent[i].img_id);
//                 rent[i].img_url = JSON.parse(rent[i].img_url);
//             }
//             res.status(200).json({
//                 status: true,
//                 data: rent
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

exports.getRentByTitle = async(req, res) => {
    const {title} = req.body;
    try {
        var rent = await Product.findAll({where: {
            title: title
        }})
        
        if(rent){
            for(let i=0; i<rent.length; i++){
                rent[i].img_id = JSON.parse(rent[i].img_id);
                rent[i].img_url = JSON.parse(rent[i].img_url);
            }
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
    const id= req.params.id;
    try {
        var rent = await Product.findOne({where: {
            id: id,
        }})
        
        if(rent){

            for(let i=0; i<rent.length; i++){
                rent[i].img_id = JSON.parse(rent[i].img_id);
                rent[i].img_url = JSON.parse(rent[i].img_url);
            }
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
                per_time: per_time,
                price: price,
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
                per_time: per_time,
                price: price,
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