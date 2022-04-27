const Product = require('../../model/food');
const cloudinary = require('../../util/cloudinary');
const User = require('../../model/user');
const fs = require('fs')

exports.createFoodService = async(req, res) => {
    const { title, description, ingredients, restaurant, price, top1, top2, top3, top4, top5, price1, price2, price3, price4, price5 } = req.body;

    var toppings_price = [
        {   top1: top1, 
            price1: price1
        }, 
        { top2: top2, 
            price2: price2
        }, 
        { top3: top3, 
            price3: price3}, 
        { top4: top4, 
            price4: price4
        }, 
        {   top5: top5, 
            price5: price5
        }
    ]
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
            restaurant,
            price: price,
            toppings_price: JSON.stringify(toppings_price),
            productType: 'food',
            img_id: JSON.stringify(ids),
            img_url: JSON.stringify(urls),
        })
        const foodout = await food.save();

        foodout.img_id = JSON.parse(foodout.img_id);
        foodout.img_url = JSON.parse(foodout.img_url);
        foodout.toppings_price= JSON.parse(foodout.toppings_price)


        res.status(201).json(foodout);
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
        ],
        include:[
            {
                model: User,
                attributes:{
                    exclude: ["createdAt", "updatedAt"]
                }
            }
        ]
    
    });

        
        if(food){
            for(let i=0; i<food.length; i++){
                food[i].img_id = JSON.parse(food[i].img_id);
                food[i].img_url = JSON.parse(food[i].img_url);
                food[i].toppings_price= JSON.parse(food[i].toppings_price)
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
            for(let i=0; i<food.length; i++){
                food[i].img_id = JSON.parse(food[i].img_id);
                food[i].img_url = JSON.parse(food[i].img_url);
                food[i].toppings_price= JSON.parse(food[i].toppings_price)
            }
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
            for(let i=0; i<food.length; i++){
                food[i].img_id = JSON.parse(food[i].img_id);
                food[i].img_url = JSON.parse(food[i].img_url);
                food[i].toppings_price= JSON.parse(food[i].toppings_price)
            }
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
            for(let i=0; i<food.length; i++){
                food[i].img_id = JSON.parse(food[i].img_id);
                food[i].img_url = JSON.parse(food[i].img_url);
                food[i].toppings_price= JSON.parse(food[i].toppings_price)
            }
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
    const {title, description, ingredents, price, top1, top2, top3, top4, top5, price1, price2, price3, price4, price5 } = req.body;
    var topping_price = [
        {   top1: top1, 
            price1: price1
        }, 
        { top2: top2, 
            price2: price2
        }, 
        { top3: top3, 
            price3: price3}, 
        { top4: top4, 
            price4: price4
        }, 
        {   top5: top5, 
            price5: price5
        }
    ]
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
                toppings_price: JSON.stringify(topping_price),
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
                toppings_price: JSON.stringify(topping_price),
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