const Product = require('../../model/studio_book');
const Image = require('../../model/studio_book_image');
const Review = require("../../model/reviewstudio")
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const fs = require('fs')
const store = require('store')


exports.createStudioService = async(req, res, next) => {
    const { title, description, location, per_time, price, rating, equipment } = req.body;
    try {
            const studio = new Product({
                    title,
                    description,
                    location,
                    per_time,
                    rating: parseFloat(rating),
                    price,
                    equipment,
                })
                var studiout = await studio.save();

            if(req.files || req.file){
                 const uploader = async (path) => await cloudinary.uploads(path, 'studioImages');
            
                const urls = [];
                const ids = []
                const files = req.files;
                for (const file of files){
                    const { path } = file;
                    const newPath = await uploader(path)
                    console.log(newPath)
                    urls.push(newPath.url);
                    ids.push(newPath.id)
                    fs.unlinkSync(path)
                }

                var studioimage = (id, url)=>{
                    var imageoutput = []
                    for(let i=0; i<id.length; i++){
                        imageoutput.push({
                            studioId: studiout.id,
                            img_id: id[i],
                            img_url: url[i]
                        });
                    }
                    return imageoutput;
                }

                await Image.bulkCreate(studioimage(ids, urls), {returning: true});
            }
           
            var output = await Product.findOne({ where: {id: studiout.id},
              include:[
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    }
                ]});

                res.redirect("/dashboard/admin/get-studio-posts")

        
        
    } catch (error) {
         console.error(error)
        next(error);
    }
}

exports.getStudioAppServices = async(req, res, next) => {
    try {
        const length = req.query.length
        var studio = await Product.findAll({
            order: [
            ['createdAt', 'ASC']
        ],
        include:[
            {
                model: Image,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Review,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                include:[
                    {
                        model: User,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                    }
                ]
            }
        ]
    });

        
        if(studio){
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
        next(error);
    }
}

exports.studioCount = async (rea, res, next)=>{
    try {
        const studios = await Product.count()
        if (studios){
            store.set("studios", studios);
            console.log('studios found:', studios)
           
                next();
           
        } else{
          console.log("no studios", studios)
          store.set("studios", studios);
                
                next();
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
        // req.flash("error", "An error occured refresh the page")
    }
}

exports.getStudioServices = async(req, res, next) => {
    try {
        const length = req.query.length
        var studio = await Product.findAll({
            order: [
            ['createdAt', 'ASC']
        ],
        include:[
            {
                model: Image,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Review,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                include:[
                    {
                        model: User,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                    }
                ]
            }
        ]
    });

        
        if(studio){
            if(studio.length <= length || length === ""|| !length){
               
                console.log("studios found")
                store.set("studio", JSON.stringify(studio));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("studio"));
                      console.log(data)
                      res.render("dashboard/admin/studios", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data
                      });
                      next();
            }else{
                let begin = length - 10;
                let end = length + 1
                var sliced = studio.slice(begin, end)
                
                console.log("studios found")
                store.set("studio", JSON.stringify(studio));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("studio"));
                      console.log(data)
                      res.render("dashboard/admin/studios", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data
                      });
                      next();
            }
        } else{
            console.log("No studio found")
            store.set("studio", JSON.stringify(studio));
                  let name = req.user.fullname.split(" ");
                  let email = req.user.email;
                  data = JSON.parse(store.get("studio"));
                  console.log(data)
                  res.render("dashboard/admin/studios", {
                    user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                    email: email,
                    data
                  });
                  next();
        }
    } catch (error) {
        console.error(error)
        next(error);
    }
}

// exports.getStudioForUser = async(req, res, next) => {
//     try {
//         const studio = await Product.findAll({ where: {
//             userid: req.user.id,
//             productType: 'studio'
//         }, include:[
//             {
//                 model: User
//             }
//         ]})
//         if(studio){
//             for(let i=0; i<studio.length; i++){
//                 studio[i].img_id = JSON.parse(studio[i].img_id);
//                 studio[i].img_url = JSON.parse(studio[i].img_url);
//             }
//             res.status(200).json({
//                 status: true,
//                 data: studio
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

exports.getStudioByTitle = async(req, res, next) => {
    const {title} = req.body;
    try {
        const studio = await Product.findAll({where: {
            title: title,
        },
        include:[
            {
                model: Image,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Review,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                include:[
                    {
                        model: User,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                    }
                ]
            }
        ]
    })
        if(studio){
            
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
        next(error);
    }
}

exports.getStudioById = async(req, res, next) => {
    const id= req.params.id;
    try {
        const studio = await Product.findOne({where: {
            id: id,
        }, 
        include:[
            {
                model: Image,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Review,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                include:[
                    {
                        model: User,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                    }
                ]
            }
        ]
    })
        if(studio){
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
        next(error);
    }
}

exports.getStudioByIdAdmin = async(req, res, next) => {
    const id= req.params.id;
    try {
        const studio = await Product.findOne({where: {
            id: id,
        }, 
        include:[
            {
                model: Image,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                }
            },
            {
                model: Review,
                attributes: {
                    exclude: ["createdAt", "updatedAt"]
                },
                include:[
                    {
                        model: User,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                    }
                ]
            }
        ]
    })
        if(studio){
            console.log("studios found")
                store.set("studio", JSON.stringify(studio));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("studio"));
                      console.log(data);
                      var img = data['studioimages']
                      
                // if(img.length){ for(var i=0; i< img.length; i++) {
                //     console.log('image found :',i ,img[i].img_url)
                // }}else{

                // }

                      res.render("dashboard/admin/studio-view", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data: data,
                        img: img
                      });
                      
        } else{
            req.flash("error", "studio with id not found")
            res.redirect("/dashboard/admin/")
        }
    } catch (error) {
         console.error(error)
        next(error);
    }
}

exports.updateStudio = async(req, res, next) => {
    const { title, description, location, per_time, price, rating, equipment } = req.body;
    try{
            await Product.update({
                title: title,
                description: description,
                location: location,
                per_time: per_time,
                rating: parseFloat(rating),
                price: price,
                equipment: equipment,
            }, { where: {
                id: req.params.studioId
            }})
       
                
        req.flash("success", "Studio successfully updated");
        res.redirect("/dashboard/admin/studio-view/" + req.params.studioId);
        
    } catch (error){
         console.error(error)
        next(error);
    }
}

exports.uploadStudioImage = async(req, res, next) => {
    try{
        if(req.files || req.file){
            const uploader = async (path) => await cloudinary.uploads(path, 'studioImages');
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

              var studioimage = (id, url)=>{
                  var imageoutput = []
                  for(let i=0; i<id.length; i++){
                      imageoutput.push({
                          studioId: req.params.studioId,
                          img_id: id[i],
                          img_url: url[i]
                      });
                  }
                  return imageoutput;
              }

             var output = await Image.bulkCreate(studioimage(ids, urls), {returning: true});
      }
     
            res.status(200).json({
                status: true,
                message: "Image added",
                data: output
            })
          
        
    } catch{
         console.error(error)
        next(error);
    }
}

exports.RemoveStudioImage = async(req, res, next) => {
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
        next(error);
    }
}

exports.deleteStudio = async (req, res, next) => {
    const id = req.params.id;
    try {
        await Product.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Image,

                }
            ]
        }).then(async (studio) => {
            if (studio) {

                if (studio.studioimages?.length) {
                    await Image.findAll({
                        where: {
                            studioId: studio.id
                        }
                    }).then(async (image) => {
                        if (image?.length) {
                            for (var i = 0; i < image.length; i++) {
                                await Image.destroy({
                                    where: {
                                        id: image[i].id
                                    }
                                })
                            }
                        }
                    })
                }

                await Product.destroy({
                    where: {
                        id: studio.id
                    }
                })
                console.log("success")
                res.redirect("/dashboard/admin/get-studio-posts")
            } else {
                req.flash("error", "studio not found")
                console.log("error")
                res.redirect("/dashboard/admin/get-studio-posts")
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}