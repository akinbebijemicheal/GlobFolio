const Product = require('../../model/cinema');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const { Op } = require('sequelize')
const fs = require('fs')

exports.createCinemaService = async(req, res) => {
    const { title, genre, storyline, rating, view_date, cast, duration, age_rate,  price } = req.body;
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
            
            // console.log({
            //     url: urls,
            //     id: ids
            // })
            const cinema = new Product({
            userid: req.user.id,
            title,
            genre,
            storyline,
            cast,
            duration,
            age_rate,
            view_date,
            rating: parseFloat(rating),
            price: price,
            productType: 'cinema',
            img_id: JSON.stringify(ids),
            img_url: JSON.stringify(urls)
        })
        var cinemaout = await cinema.save();
        // let img_url = JSON.parse(cinemaout.img_url);
        // let img_id = JSON.parse(cinemaout.img_id);
        cinemaout.img_url =JSON.parse(cinemaout.img_url);
        cinemaout.img_id = JSON.parse(cinemaout.img_id);
        res.status(201).json({
            data: {
                cinemaout,
                // img_id,
                // img_url
            }
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


exports.getCinemaServices = async(req, res) => {
    const status = req.query.status;
    const length = req.query.length
    try {
        if(status === "showing"){
            var cinema = await Product.findAll({where: {
                productType: 'cinema',
                view_date: (new Date).toISOString().substr(0, 10)
            },
            order: [
                ['view_date', 'ASC']
            ],
        });

            cinema.img_id = JSON.parse(cinema.img_id);
            cinema.img_url = JSON.parse(cinema.img_url)
        }

        if(status === "soon"){
            cinema = await Product.findAll({
                where: {
                productType: 'cinema',
                view_date: {
                    [Op.gt]: (new Date).toISOString().substr(0, 10)
                } 
            }, order: [
                ['view_date', 'ASC']
            ],});
            cinema.img_id = JSON.parse(cinema.img_id);
            cinema.img_url = JSON.parse(cinema.img_url)
        }

        if(status === "rated"){
            var cinema = await Product.findAll({where: {
                productType: 'cinema',
            },
            order: [
                ['rating', 'DESC'],
                ['view_date', 'ASC']
            ],
        });
            cinema.img_id = JSON.parse(cinema.img_id);
            cinema.img_url = JSON.parse(cinema.img_url)
        }

        if(!status){
            var cinema = await Product.findAll({where: {
                productType: 'cinema',
            },
            order: [
                ['view_date', 'ASC']
            ],
        });
            cinema.img_id = JSON.parse(cinema.img_id);
            cinema.img_url = JSON.parse(cinema.img_url)
        }
      
        if(cinema){
            if(cinema.length <= length || length === ""){
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

exports.getCinemaForUser = async(req, res) => {
    try {
        const cinema = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'cinema'
        }, include:[
            {
                model: User
            }
        ]})
        if(cinema){
            cinema.img_id = JSON.parse(cinema.img_id);
            cinema.img_url = JSON.parse(cinema.img_url)
            res.status(200).json({
                status: true,
                data: cinema
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

exports.getCinemaByTitle = async(req, res) => {
    const title= req.body;
    try {
        const cinema = await Product.findAll({where: {
            title: title,
            productType: 'cinema'
        }, include:[
            {
                model: User
            }
        ]})
        if(cinema){
            cinema.img_id = JSON.parse(cinema.img_id);
            cinema.img_url = JSON.parse(cinema.img_url)
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
exports.getCinemaById = async(req, res) => {
    const id= req.parmas.id;
    try {
        const cinema = await Product.findAll({where: {
            id: id,
            productType: 'cinema'
        }, include:[
            {
                model: User
            }
        ]})
        if(cinema){
            cinema.img_id = JSON.parse(cinema.img_id);
            cinema.img_url = JSON.parse(cinema.img_url)
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
                genre: genre,
                storyline: storyline,
                cast: cast,
                view_date: view_date,
                duration: duration,
                age_rate: age_rate,
                rating: parseFloat(rating),
                price: price,
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls),
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'cinema'
            }})
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        } else{
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
                id: req.params.id,
                userid: req.user.id,
                productType: 'cinema'
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