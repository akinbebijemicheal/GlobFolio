const Product = require('../../model/food');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const fs = require('fs')

exports.createFoodService = async(req, res) => {
    const { title, description, ingredients, price } = req.body;
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

            const food = new Product({
            userid: req.user.id,
            title,
            description,
            ingredients,
            price: price,
            productType: 'food',
            img_id: JSON.stringify(ids),
            img_url: JSON.stringify(urls),
        })
        const foodout = await food.save();

        foodout.img_id = JSON.parse(foodout.img_id);
        foodout.img_url = JSON.parse(foodout.img_url)

        res.status(201).json(foodout)
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

exports.getFoodServices = async(req, res) => {
    try {
        const length = req.query.length;

        var food = await Product.findAll({ where: {
            productType: 'food'
        },
        order: [
            ['createdAt', 'ASC']
        ],});

        
        if(food){
            for(let i=0; i<food.length; i++){
                food[i].img_id = JSON.parse(food[i].img_id);
                food[i].img_url = JSON.parse(food[i].img_url);
            }

            if(food.length <= length || length === "" || !length){
               
                res.status(200).json({
                    status: true,
                    data: food
                });
            }else{
                
                let begin = length - 10;
                let end = length + 1
                var sliced = food.slice(begin, end)
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

exports.getFoodForUser = async(req, res) => {
    try {
        var food = await Product.findAll({ where: {
            userid: req.user.id,
            productType: 'food'
        }, include:[
            {
                model: User
            }
        ]} )

        
        if(food){
            food.img_id = JSON.parse(food.img_id);
            food.img_url = JSON.parse(food.img_url)
            res.status(200).json({
                status: true,
                data: food
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

exports.getFoodByTitle = async(req, res) => {
    const title = req.body;
    try {
        var food = await Product.findAll({where: {
            title: title,
            productType: 'food'
        }, include:[
            {
                model: User
            }
        ]} )

        
        if(food){
            food.img_id = JSON.parse(food.img_id);
            food.img_url = JSON.parse(food.img_url)
            res.status(200).json({
                status: true,
                data: food})
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

exports.getFoodById = async(req, res) => {
    const id= req.parmas.id;
    try {
        var food = await Product.findAll({where: {
            id: id,
            productType: 'food'
        }, include:[
            {
                model: User
            }
        ]})
       
        if(food){
            food.img_id = JSON.parse(food.img_id);
            food.img_url = JSON.parse(food.img_url)
            res.status(200).json({
                status: true,
                data: food})
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

exports.updateFood = async(req, res) => {
    const {title, description, ingredents, price } = req.body;
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
                ingredents: ingredents,
                price: price,
                img_id: JSON.stringify(ids),
                img_url: JSON.stringify(urls)
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'food',
            }})
            res.status(200).json({
                status: true,
                message: "Post updated"
            })
        } else{
            await Product.update({
                title: title,
                description: description,
                ingredents: ingredents,
                price: price,
            }, { where: {
                id: req.params.id,
                userid: req.user.id,
                productType: 'food'
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