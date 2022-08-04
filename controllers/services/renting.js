const Product = require('../../model/renting');
const Image = require('../../model/rentingimage');
const Review = require("../../model/reviewrent")
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const fs = require('fs')
const store = require('store')


exports.createRentService = async(req, res, next) => {
    const { title, description, location, equipment, per_time, price, available_rent } = req.body;
    try {
        const rent = new Product({
            title,
            description,
            location,
            per_time,
            equipment,
            price: price,
            available_rent
        })
        var rentout = await rent.save();

        if(req.files || req.file){
            const uploader = async (path) => await cloudinary.uploads(path, 'rentImages');
                        
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

                    var rentimage = (id, url)=>{
                        var imageoutput = []
                        for(let i=0; i<id.length; i++){
                            imageoutput.push({
                                rentId: rentout.id,
                                img_id: id[i],
                                img_url: url[i]
                            });
                        }
                        return imageoutput;
                    }
    
                    await Image.bulkCreate(rentimage(ids, urls), {returning: true});
        }
            
        var output = await Product.findOne({ where: {id: rentout.id},
            include:[
                {
                    model: Image,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                }
            ]});

            res.redirect("/dashboard/admin/get-rent-services")
       
    } catch (error) {
        console.error(error)
        next(error);
    }
}


exports.getRentAppServices = async(req, res, next) => {
    try {
        const length = req. query.length;
        var rent = await Product.findAll({
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

        
        if(rent){
            
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
        next(error);
    }
}


exports.rentCount = async (rea, res, next)=>{
    try {
        const rents = await Product.count()
        if (rents){
            store.set("rents", rents);
            console.log('rents found:', rents)
           
                next();
           
        } else{
          console.log("no rents", rents)
          store.set("rents", rents);
                
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

exports.getRentAdminServices = async(req, res, next) => {
    try {
        const length = req. query.length;
        var rent = await Product.findAll({
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

        
        if(rent){
            
            if(rent.length <= length || length === "" || !length){
                
                console.log("rents found")
                store.set("rent", JSON.stringify(rent));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("rent"));
                      console.log(data)
                      res.render("dashboard/admin/rents", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data
                      });
                      next();
            }else{
                let begin = length - 10;
                let end = length + 1
                var sliced = rent.slice(begin, end)
                console.log("rents found")
                store.set("rent", JSON.stringify(rent));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("rent"));
                      console.log(data)
                      res.render("dashboard/admin/rents", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data
                      });
                      next();
            }
        } else{
            console.log("No rents found")
                store.set("rent", JSON.stringify(rent));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("rent"));
                      console.log(data)
                      res.render("dashboard/admin/rents", {
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

// exports.getRentForUser = async(req, res, next) => {
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

exports.getRentByTitle = async(req, res, next) => {
    const {title} = req.body;
    try {
        var rent = await Product.findAll({where: {
            title: title
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
        
        if(rent){
            
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
        next(error);
    }
}

exports.getRentById = async(req, res, next) => {
    const id= req.params.id;
    try {
        var rent = await Product.findOne({where: {
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
        
        if(rent){

          
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
        next(error);
    }
}

exports.getRentByIdAdmin = async(req, res, next) => {
    const id= req.params.id;
    try {
        var rent = await Product.findOne({where: {
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
        
        if(rent){

            console.log("rents found")
            store.set("rent", JSON.stringify(rent));
                  let name = req.user.fullname.split(" ");
                  let email = req.user.email;
                  data = JSON.parse(store.get("rent"));
                  console.log(data);
                  var img = data['rentimages']
                  
            // if(img.length){ for(var i=0; i< img.length; i++) {
            //     console.log('image found :',i ,img[i].img_url)
            // }}else{

            // }

                  res.render("dashboard/admin/rent-view", {
                    user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                    email: email,
                    data: data,
                    img: img
                  });
                  
    } else{
        req.flash("error", "rent with id not found")
        res.redirect("/dashboard/admin/")
    }
    } catch (error) {
        console.error(error)
        next(error);
    }
}

exports.updateRent = async(req, res, next) => {
    const { title, description, equipment, location, per_time, price, available_rent } = req.body;
    try{
       
            await Product.update({
                title: title,
                description: description,
                location: location,
                per_time: per_time,
                equipment,
                price: price,
                available_rent,
            }, { where: {
                id: req.params.id
            }})
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        
        
    } catch{
        console.error(error)
        next(error);
    }
}

exports.uploadRentImage = async(req, res, next) => {
    try{
        if(req.files || req.file){
            const uploader = async (path) => await cloudinary.uploads(path, 'rentImages');
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

              var rentimage = (id, url)=>{
                  var imageoutput = []
                  for(let i=0; i<id.length; i++){
                      imageoutput.push({
                          rentId: req.params.rentId,
                          img_id: id[i],
                          img_url: url[i]
                      });
                  }
                  return imageoutput;
              }

             var output = await Image.bulkCreate(rentimage(ids, urls), {returning: true});
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

exports.RemoveRentImage = async(req, res, next) => {
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

exports.deleteRent = async (req, res, next) => {
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
        }).then(async (rent) => {
            if (rent) {

                if (rent.rentimages?.length) {
                    await Image.findAll({
                        where: {
                            rentId: rent.id
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
                        id: rent.id
                    }
                })
                console.log("success")
                res.redirect("/dashboard/admin/get-rent-services")
            } else {
                req.flash("error", "rent not found")
                console.log("error")
                res.redirect("/dashboard/admin/get-rent-services")
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}