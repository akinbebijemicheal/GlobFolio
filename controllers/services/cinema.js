const Product = require('../../model/cinema');
const Image = require("../../model/cinemaimage");
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const { Op } = require('sequelize')
const fs = require('fs')

exports.createCinemaService = async(req, res) => {
    const { title, genre, storyline, rating, view_date, cast, duration, age_rate,  price } = req.body;
    try {

        const cinema = new Product({
            title,
            genre,
            storyline,
            cast,
            duration,
            age_rate,
            view_date,
            rating: parseFloat(rating),
            price: price,
        })
        var cinemaout = await cinema.save();

        if(req.file || req.files){
             const uploader = async (path) => await cloudinary.uploads(path, 'cinemaImages');
            
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

                var cinemaImages = (id, url)=>{
                    var imageoutput = []
                    for(let i=0; i<id.length; i++){
                        imageoutput.push({
                            cinemaId: cinemaout.id,
                            img_id: id[i],
                            img_url: url[i]
                        });
                    }
                    return imageoutput;
                }

                await Image.bulkCreate(cinemaImages(ids, urls), {returning: true});
        }
           
        var out = await Product.findOne({
            where:{
                id: cinemaout.id
            }, include:[
                {
                    model: Image,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                }
            ]
        })

            
       
        res.status(201).json({
            status: true,
            data: out
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


exports.getCinemaServices = async(req, res) => {
    const status = req.query.status;
    const length = req.query.length
    try {
        if(status === "showing"){
            var cinema = await Product.findAll({where: {
                view_date: (new Date).toISOString().substr(0, 10)
            },
            order: [
                ['view_date', 'ASC']
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

            
        }

        if(status === "soon"){
            cinema = await Product.findAll({
                where: {
                view_date: {
                    [Op.gt]: (new Date).toISOString().substr(0, 10)
                } 
            }, order: [
                ['view_date', 'ASC']
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
            
        }

        if(status === "rated"){
            var cinema = await Product.findAll({
            order: [
                ['rating', 'DESC'],
                ['view_date', 'ASC']
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
            
        }

        if(!status){
            var cinema = await Product.findAll({
            order: [
                ['view_date', 'ASC']
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
            
        }
      
        if(cinema){

            if(cinema.length <= length || length === "" || !length){
                res.status(200).json({
                    status: true,
                    data: cinema
                });
            }else{
                let begin = length - 10;
                let end = length + 1;
                var sliced = cinema.slice(begin, end);
                
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

exports.getCinemaByTitle = async(req, res) => {
    const { title }= req.body;
    try {
        var cinema = await Product.findAll({where: {
            title: title
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
        if(cinema){
            res.status(200).json({
                status: true,
                data: cinema
            })
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
exports.getCinemaById = async(req, res) => {
    const id= req.params.id;
    try {
        var cinema = await Product.findOne({where: {
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
    const { title, genre, storyline, rating, view_date, cast, duration, age_rate,  price } = req.body;
    try{
        
            await Product.update({
                title: title,
                genre: genre,
                storyline: storyline,
                cast: cast,
                view_date: view_date,
                duration: duration,
                age_rate: age_rate,
                rating: parseFloat(rating),
                price: price,
            }, { where: {
                id: req.params.id
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

exports.uploadCinemaImage = async(req, res) => {
    try{
        if(req.files || req.file){
            const uploader = async (path) => await cloudinary.uploads(path, 'cinemaImages');
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

              var cinemaimage = (id, url)=>{
                  var imageoutput = []
                  for(let i=0; i<id.length; i++){
                      imageoutput.push({
                          cinemaId: req.params.cinemaId,
                          img_id: id[i],
                          img_url: url[i]
                      });
                  }
                  return imageoutput;
              }

             var output = await Image.bulkCreate(cinemaimage(ids, urls), {returning: true});
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

exports.RemoveCinemaImage = async(req, res) => {
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