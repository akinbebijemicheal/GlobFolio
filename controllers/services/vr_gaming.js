const Product = require('../../model/vr_gaming');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const fs = require('fs')

exports.createGamingService = async(req, res) => {
    const { title, description, genre, price, age_rate,} = req.body;
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
            const game = new Product({
                title,
                description,
                genre,
                price: price,
                age_rate,
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            })
            const gameout = await game.save();
            gameout.img_id = JSON.parse(gameout.img_id);
            gameout.img_url = JSON.parse(gameout.img_url)

            res.status(201).json(gameout);
        
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
        var game = await Product.findAll();

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

// exports.getGamingForUser = async(req, res) => {
//     try {
//         var game = await Product.findAll({ where: {
//             userid: req.user.id,
//             productType: 'game'
//         }, include:[
//             {
//                 model: User
//             }
//         ]})
       
//         if(game){
//             for(let i=0; i<game.length; i++){
//                 game[i].img_id = JSON.parse(game[i].img_id);
//                 game[i].img_url = JSON.parse(game[i].img_url);
//             }
//             res.status(200).json({
//                 status: true,
//                 data: game
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

exports.getGamingByTitle = async(req, res) => {
    const {title} = req.body;
    try {
        var game = await Product.findAll({where: {
            title: title,
        }})
       
        if(game){
            for(let i=0; i<game.length; i++){
                game[i].img_id = JSON.parse(game[i].img_id);
                game[i].img_url = JSON.parse(game[i].img_url);
            }
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
        }})
        
        if(game){
            for(let i=0; i<game.length; i++){
                game[i].img_id = JSON.parse(game[i].img_id);
                game[i].img_url = JSON.parse(game[i].img_url);
            }
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
                genre: genre,
                price: price,
                age_rate: age_rate,
            }, { where: {
                id: req.params.id,
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