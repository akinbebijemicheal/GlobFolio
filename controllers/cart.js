const Cart = require("../model/cart");
const CartItem = require("../model/cartItem");
const User = require("../model/user");
const Product = require("../model/product");
const Order = require("../model/order");

exports.AddCart = async(req, res)=>{
    try {

        const product = await Product.findOne({
            where: {
                id: req.params.productid
            }
        })
                const item = new CartItem({
                    productid: req.params.productid,
                    userid: req.user.id,
                    price: product.price
                })
                await item.save();
                const getcart = await CartItem.findOne({
                    userid: req.user.id,
                    productid: req.params.productid
                })
                await Cart.create({
                    userid: req.user.id,
                    cartitemid: getcart.id
                })
                
                const viewcart = await Cart.findAll({ where: {
                    userid: req.user.id
                }, 
                        include: [
                            {
                                model: CartItem,
                                include:[
                                    {
                                        model: Product,
                                        attributes: {
                                            exclude: ["createdAt", "updatedAt"],
                                        },
                                    }
                                ],
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"],
                                },
                            },
                            {
                                model: User,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"],
                                },
                            }
                        ]
                    }) 

                // await Order.findOne({
                //     where: {
                //         userid: req.user.id
                //     }
                // }).then((order) => {
                //     if(!order){
                //         await Order.create({
                //             userid: req.user.id,
                //             cart: JSON.stringify(viewcart)
                //         })
                //     }else{
                //         await Order.update(
                //             { cart: JSON.stringify(viewcart) },
                //         { where: {
                //             userid: req.user.id
                //         }})
                //     }
                // })    

                res.status(201).json({
                    staus: true,
                    data: viewcart
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

exports.viewCart = async(req, res) => {
    try {
        const viewcart = await Cart.findAll({ where: {
            userid: req.user.id
        }, 
                include: [
                    {
                        model: CartItem,
                        include:[
                            {
                                model: Product,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"],
                                },
                            }
                        ],
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                    },
                    {
                        model: User,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                    }
                ]
            }) 
            res.status(200).json({
                staus: true,
                data: viewcart
            })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "An error occured",
             error: error
         })
    }
};

exports.DeleteCartItem = async(req, res)=> {
    try {
        await CartItem.findOne({
            where: {
                userid: req.user.id,
                productid: req.params.productid
            }
        }).then((item) =>{
            if(item){
                await CartItem.destroy({ where: {
                    userid: item.id,
                    productid: item.productid
                }})
                res.status(200).json({
                    status: true,
                    message: "Product Removed Successfully"
                })
            }else{
                res.status(404).json({
                    status: false,
                    message: "Product not found"
                })
            }
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

exports.addQty = async(req, res)=> {
    var qty = req.body;
    qty = parseInt(qty)
    try {
        await CartItem.findOne({
            where: {
                userid: req.user.id,
                productid: req.params.productid
            }
        }).then((item) =>{
            if(item){
                const product = await Product.findOne({
                    where: {
                        id: req.params.productid
                    }
                })

                var price = parseInt(product.price)
                price = price * qty

                await CartItem.update({
                     qty: qty,
                     price: price.toString(),
                    
                },
                     { where: {
                    userid: item.id,
                    productid: item.productid
                }})
                const result = await CartItem.findOne({
                    where: {
                        userid: req.user.id,
                        productid: req.params.productid
                    }
                })
                res.status(200).json({
                    status: true,
                    message: "Product Quantity Increased",
                    data: result
                })
            }else{
                res.status(404).json({
                    status: false,
                    message: "Product not found"
                })
            }
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

exports.createOrder = async(req, res)=>{
    const { address, phone_no, cart } = req.body;
    try {

                await Order.create({
                    address: address,
                    phone_no: phone_no,
                    cart: cart
                })

        // await Order.findOne({
        //     where: {
        //         userid: req.user.id
        //     }
        // }).then((order) =>{
        //     const result = {
        //         id: order.id,
        //         userid: order.userid,
        //         fullname: req.user.fullname,
        //         address: order.address,
        //         phone_no: order.phone_no,
        //         delivery_status: order.delivery_status,
        //         cart: JSON.parse(order.cart),
        //         createAt: order.createAt,
        //         updateAt: order.updateAt
        //     }
        //     res.status(200).json({
        //         status: true,
        //         data: result,
        //     })
        // })

        res.status(200).json({
                    status: true,
                    message: "Order created",
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

exports.viewOrder = async(req, res)=>{
    try {
        await Order.findOne({
            where: {
                userid: req.user.id
            }
        }).then((order) =>{
            const result = {
                id: order.id,
                userid: order.userid,
                fullname: req.user.fullname,
                address: order.address,
                phone_no: order.phone_no,
                delivery_status: order.delivery_status,
                cart: JSON.parse(order.cart),
                createAt: order.createAt,
                updateAt: order.updateAt
            }
            res.status(200).json({
                status: true,
                data: result,
            })
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

exports.updateOrderStatus = async(req, res)=>{
    const delivery_status = req.body;
    try {
        await Order.update({
            delivery_status: delivery_status
        }, {
            where: {
                userid: req.user.id
            }
        })

        await Order.findOne({ where: {
            userid: req.user.id
        }
           
        }).then((order) =>{
            const result = {
                id: order.id,
                userid: order.userid,
                fullname: req.user.fullname,
                address: order.address,
                phone_no: order.phone_no,
                delivery_status: order.delivery_status,
                cart: JSON.parse(order.cart),
                createAt: order.createAt,
                updateAt: order.updateAt
            }
            res.status(200).json({
                status: true,
                data: result,
            })
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

