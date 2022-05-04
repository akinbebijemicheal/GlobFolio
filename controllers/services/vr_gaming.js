const Product = require('../../model/vr_gaming');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const fs = require('fs')

exports.createGamingService = async(req, res) => {
    const { title, description, genre, price, age_rate,} = req.body;
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
            const game = new Product({
                userid: req.user.id,
                title,
                description,
                genre,
                price: price,
                age_rate,
                productType: 'game',
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            })
            const gameout = await game.save();
            gameout.img_id = JSON.parse(gameout.img_id);
            gameout.img_url = JSON.parse(gameout.img_url)

            res.status(201).json(gameout)
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


exports.getGamingServices = async(req, res) => {
    try {
        const length = req.query.length
        var game = await Product.findAll({where: {
            productType: 'game'
        }});

        if(game){
            for(let i=0; i<game.length; i++){
                game[i].img_id = JSON.parse(game[i].img_id);
                game[i].img_url = JSON.parse(game[i].img_url);
            }
            if(game.length <= length || length === "" || !length){

                res.status(200).json({
                    status: true,
                    data: game
                });
            }else{
                let begin = length - 10;
                let end = length + 1
                var sliced = game.slice(begin, end)

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

exports.getGamingForUser = async(req, res) => {
    try {
        var game = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'game'
        }, include:[
            {
                model: User
            }
        ]})
       
        if(game){
            game.img_id = JSON.parse(game.img_id);
            game.img_url = JSON.parse(game.img_url)
            res.status(200).json({
                status: true,
                data: game
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

exports.getGamingByTitle = async(req, res) => {
    const {title} = req.body;
    try {
        var game = await Product.findAll({where: {
            title: title,
            productType: 'game'
        }, include:[
            {
                model: User
            }
        ]})
       
        if(game){
            game.img_id = JSON.parse(game.img_id);
            game.img_url = JSON.parse(game.img_url)
            res.status(200).json({
                status: true,
                data: game})
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

exports.getGameById = async(req, res) => {
    const id= req.params.id;
    try {
        var game = await Product.findAll({where: {
            id: id,
            productType: 'game'
        }, include:[
            {
                model: User
            }
        ]})
        
        if(game){
            game.img_id = JSON.parse(game.img_id);
            game.img_url = JSON.parse(game.img_url)
            res.status(200).json({
                status: true,
                data: game})
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

exports.updateGaming = async(req, res) => {
    const { title, description, genre, price, age_rate,} = req.body;
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
                genre: genre,
                price: price,
                age_rate: age_rate,
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'game'
            }})
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        } else{
            await Product.update({
                title: title,
                description: description,
                genre: genre,
                price: price,
                age_rate: age_rate,
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'game'
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