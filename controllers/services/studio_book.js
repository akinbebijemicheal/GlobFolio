const Product = require('../../model/studio_book');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const fs = require('fs')

exports.createStudioService = async(req, res) => {
    const { title, description, location, per_time, price, rating, equipment } = req.body;
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

            const studio = new Product({
                userid: req.user.id,
                title,
                description,
                location,
                per_time,
                rating: parseFloat(rating),
                price: price,
                equipment,
                productType: 'studio',
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            })
            const studiout = await studio.save();

            studiout.img_id = JSON.parse(studiout.img_id);
            studiout.img_url = JSON.parse(studiout.img_url)

            res.status(201).json(studiout)
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


exports.getStudioServices = async(req, res) => {
    try {
        const length = req.query.length
        var studio = await Product.findAll({where: {
            productType: 'studio'
        },  order: [
            ['createdAt', 'ASC']
        ]});

        
        if(studio){
            for(let i=0; i<studio.length; i++){
                studio[i].img_id = JSON.parse(studio[i].img_id);
                studio[i].img_url = JSON.parse(studio[i].img_url);
            }
            if(studio.length <= length || length === ""|| !length){
               
                res.status(200).json({
                    status: true,
                    data: studio
                });
            }else{
                let begin = length - 10;
                let end = length + 1
                var sliced = studio.slice(begin, end)
                
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

exports.getStudioForUser = async(req, res) => {
    try {
        const studio = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'studio'
        }, include:[
            {
                model: User
            }
        ]})
        if(studio){
            for(let i=0; i<studio.length; i++){
                studio[i].img_id = JSON.parse(studio[i].img_id);
                studio[i].img_url = JSON.parse(studio[i].img_url);
            }
            res.status(200).json({
                status: true,
                data: studio
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

exports.getStudioByTitle = async(req, res) => {
    const {title} = req.body;
    try {
        const studio = await Product.findAll({where: {
            title: title,
            productType: 'studio'
        }, include:[
            {
                model: User
            }
        ]})
        if(studio){
            for(let i=0; i<studio.length; i++){
                studio[i].img_id = JSON.parse(studio[i].img_id);
                studio[i].img_url = JSON.parse(studio[i].img_url);
            }
            res.status(200).json({
                status: true,
                data: studio})
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

exports.getStudioById = async(req, res) => {
    const id= req.params.id;
    try {
        const studio = await Product.findAll({where: {
            id: id,
            productType: 'studio'
        }, include:[
            {
                model: User
            }
        ]})
        if(studio){
            for(let i=0; i<studio.length; i++){
                studio[i].img_id = JSON.parse(studio[i].img_id);
                studio[i].img_url = JSON.parse(studio[i].img_url);
            }
            res.status(200).json({
                status: true,
                data: studio})
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

exports.updateStudio = async(req, res) => {
    const { title, description, location, per_time, price, rating, equipment } = req.body;
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
                per_time: per_time,
                rating: parseFloat(rating),
                price: price,
                equipment: equipment,
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'studio'
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
                rating: parseFloat(rating),
                price: price,
                equipment: equipment,
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'studio'
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