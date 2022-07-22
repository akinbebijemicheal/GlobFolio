require('dotenv').config()
const paystack = require('paystack')(process.env.PAYSTACK_SECRET);
const Game = require('../model/vr_gaming');
const GameBooking = require('../model/vr_gamebooking');
const Transaction = require('../model/usertransactions');
const User = require('../model/user')
const store = require('store')


exports.bookGame = async(req, res, next)=>{
    var {quantity, date, time}= req.body;
    const id = req.params.gameId;
    try {
        if(!quantity){
            quantity = 1
        }
        await Game.findOne({
            where: {
                id: id
            }
        }).then(async(game) => {
            if(game && game.available_game >= 1){
                let fname = req.user.fullname.split(' ')
                paystack.transaction.initialize({
                    name: `${game.title}`,
                    email: req.user.email,
                    amount: (parseInt(game.price) * quantity) * 100,
                    quantity: quantity,
                    callback_url: `${process.env.REDIRECT_SITE}/VerifyPay/game`,
                    metadata: {
                        userId: req.user.id,
                        game: game.id,
                        title: game.title,
                        
                                                 
                    }
                }).then(async (transaction)=>{
                    console.log(transaction)
                    if(transaction){
                        const book = new GameBooking({
                            buyerId: req.user.id,
                            gameId: game.id,
                            quantity: quantity,
                            scheduled_date: date,
                            scheduled_time: time,
                            transaction_url: transaction.data.authorization_url,
                            ref_no: transaction.data.reference,
                            access_code: transaction.data.access_code
                        })
                        var savedbook = await book.save();

                        res.json({
                            status: true,
                            data:{
                                game: game,
                                savedbook
                            }
                        })
                    }
                }).catch(err=> console.log(err))
            }else{
                res.json({
                    status: false,
                    message: "No rent found or rent not available"
                })
            }
        }).catch(err=> console.log(err))
    } catch (error) {
        console.error(error);
        next(error)
    }
};

exports.gameVerify = async(req, res, next)=>{
    const ref = req.query.trxref;
    // const userId = req.user.id
    try {
                await Transaction.findOne({
                    where:{
                        ref_no: ref
                    }
                }).then(async (trn)=>{
                    if(trn){
                        var verify = "Payment Already Verified"
                        // res.json("Payment Already Verified")
                    }else{
                        paystack.transaction.verify(ref).then(async(transaction) => {
                            console.log(transaction);
                            // res.json(transaction)
                            if(!transaction){
                                verify = `Transaction on the reference no: ${ref} not found`
                                // res.json({
                                //     status: false,
                                //     message: `Transaction on the reference no: ${ref} not found`
                                // })
                            }

                            var trnx = new Transaction({
                                userId: transaction.data.metadata.userId,
                                ref_no: ref,
                                status: transaction.data.status,
                                ProductType: "Game",
                                price: `${transaction.data.currency} ${transaction.data.amount / 100}`,
                                description: `${transaction.data.metadata.title}`
                            })
                            var savetrnx = await trnx.save()
                            verify = "Payment" +" " +transaction.message

                                var game = await Game.findOne({
                                    where: {
                                        id: transaction.data.metadata.game
                                    }
                                })
                                await GameBooking.findOne({
                                    where:{
                                        ref_no: ref
                                    }
                                }).then(async (book) => {
                                    if(book){
                                        await GameBooking.update({
                                            transactionId: savetrnx.id
                                        }, { where: {
                                            id: book.id
                                        }})

                                        await Game.update({
                                            available_game: (game.available_game - book.quantity)
                                        }, {where:{
                                                id: game.id
                                        }})
                                    } 
                                }).catch(err => console.log(err))
                                    // res.json({
                                    //     status: true,
                                    //     message: `Payment ${transaction.message}`,
                                    //     transaction: savetrnx,
                                    // })
                            
                                    res.render("base/verify-game",{
                                        verify
                                    })
                        }).catch(error => console.error(error))
                    }
                }).catch(error => console.error(error))
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getGamebookings = async(req, res, next)=>{
    try {
        await GameBooking.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
            include:[
                {
                    model: User,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Game,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                
                {
                    model: Transaction,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                }
            ]
        }).then(async(book)=>{
            if(book){
                console.log("Games Bookings found")
                store.set("book", JSON.stringify(book));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("book"));
                      console.log(data)
                      res.render("dashboard/admin/vr-gaming-bookings", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data: data
                      });
                      next();
            }else{
                console.log("No Games Bookings found")
                store.set("book", JSON.stringify(book));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("book"));
                      console.log(data)
                      res.render("dashboard/admin/vr-gaming-bookings", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data: data
                      });
                      next();
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getUserGamebookings = async(req, res, next)=>{
    try {
        await GameBooking.findAll({
            where: {
                userId: req.user.id
            },
            order: [
                ['createdAt', 'ASC']
            ],
            include:[
                {
                    model: User,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Game,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Transaction,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                }
            ]
        }).then(async(book)=>{
            if(book){
                res.json({
                    status: true,
                    data: book
                })
            }else{
                res.json({
                    status: false,
                    message: "No Game Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getGamebooking = async(req, res, next)=>{
    try {
        await GameBooking.findOne({
            where:{
                id: req.params.bookingId
            },
            order: [
                ['createdAt', 'ASC']
            ],
            include:[
                {
                    model: User,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Game,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Transaction,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                }
            ]
        }).then(async(book)=>{
            if(book){
                res.json({
                    status: true,
                    data: book
                })
            }else{
                res.json({
                    status: false,
                    message: "No Game Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}




