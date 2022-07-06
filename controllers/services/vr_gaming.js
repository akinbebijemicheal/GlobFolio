const Product = require('../../model/vr_gaming');
const Image = require('../../model/vr_gaming_image');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const fs = require('fs')

exports.createGamingService = async(req, res) => {
    const { title, description, genre, price, age_rate,} = req.body;
        try {  
            const game = new Product({
                    title,
                    description,
                    genre,
                    price: price,
                    age_rate,
                })
                var gameout = await game.save();

                if(req.files || req.file){
                        const uploader = async (path) => await cloudinary.uploads(path, 'gameImages');
                    
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
                        
                        var gameimage = (id, url)=>{
                            var imageoutput = []
                            for(let i=0; i<id.length; i++){
                                imageoutput.push({
                                    gameId: gameout.id,
                                    img_id: id[i],
                                    img_url: url[i]
                                });
                            }
                            return imageoutput;
                        }
        
                        await Image.bulkCreate(gameimage(ids, urls), {returning: true});
                }
            
            var output = await Product.findOne({ where: {id: rentout.id},
                order: [
                    ['rating', 'ASC']
                ], include:[
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    }
                ]});

            res.status(201).json({
                status: true,
                data: output
            });
        
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
        var game = await Product.findAll({
            order: [
                ['createdAt', 'ASC']
        ],
        include:[
            {
                model: Image,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            }
        ]
        });

        if(game){
           
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
        }, 
        include:[
            {
                model: Image,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            }
        ]
    })
       
        if(game){
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
        var game = await Product.findOne({where: {
            id: id,
        }, 
        include:[
            {
                model: Image,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            }
        ]
    })
        
        if(game){
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
        
        
    } catch{
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "An error occured",
             error: error
         })
    }
}

exports.uploadGameImage = async(req, res) => {
    try{
        if(req.files || req.file){
            const uploader = async (path) => await cloudinary.uploads(path, 'gameImages');
              var urls = [];
              var ids = []
              const files = req.files;
              for (const file of files){
                  const { path } = file;
                  const newPath = await uploader(path)
                  urls.push(newPath.url);
                  ids.push(newPath.id)
                  fs.unlinkSync(path)
              }

              var gameimage = (id, url)=>{
                  var imageoutput = []
                  for(let i=0; i<id.length; i++){
                      imageoutput.push({
                          gameId: req.params.gameId,
                          img_id: id[i],
                          img_url: url[i]
                      });
                  }
                  return imageoutput;
              }

             var output = await Image.bulkCreate(gameimage(ids, urls), {returning: true});
      }
     
            res.status(200).json({
                status: true,
                message: "Image added",
                data: output
            })
          
        
    } catch{
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "An error occured",
             error: error
         })
    }
}

exports.RemoveGameImage = async(req, res) => {
    try{
       
        await Image.findOne({
            where: {
                id: req.params.imageId
            }
        }).then(async(image)=>{
            if(image){
                await cloudinary.cloudinary.uploader.destroy(image.img_id);
                await Image.destroy({
                    where:{
                        id: image.id
                    }
                });

                res.status(200).json({
                    status: true,
                    message: "Image Removed",
                })
            }else{
                res.status(404).json({
                    status: false,
                    message: "Image Not Found",
                })
            }
        })
     
    } catch{
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "An error occured",
             error: error
         })
    }
}