require('dotenv').config()
const paystack = require('paystack')(process.env.PAYSTACK_SECRET);
const HotelExtras = require('../model/hotelextras');
const Hotel = require('../model/hotel');
const HotelBooking = require('../model/hotelbooking');
const Transaction = require('../model/usertransactions');
const User = require('../model/user')

exports.bookHotel = async(req, res, next)=>{
    var {roomId, quantity}= req.body;
    try {
        if(!quantity){
            quantity = "1"
        }
        await HotelExtras.findOne({
            where: {
                id: roomId
            }, include:[
                {
                    model: Hotel,
                    attributes: {
                        exclude:["createdAt", "updatedAt"]
                    }
                }
            ]
        }).then(async(room) => {
            if(room){
                let fname = req.user.fullname.split(' ')
                paystack.transaction.initialize({
                    name: `${room.hotel.title} (${room.room})`,
                    email: req.user.email,
                    amount: parseInt(room.price) * 100,
                    quantity: parseInt(quantity),
                    callback_url: `${process.env.REDIRECT_SITE}/api/pay/hotel/verify`,
                    metadata: {
                        userId: req.user.id,
                        room: room.id,
                        hotel: room.hotel.title,
                        display_name: room.room                          
                    }
                }).then(async (transaction)=>{
                    console.log(transaction)
                    if(transaction){
                        const book = new HotelBooking({
                            buyerId: req.user.id,
                            hotelId: room.hotelId,
                            hotelextrasId: room.id,
                            transaction_url: transaction.data.authorization_url,
                            ref_no: transaction.data.reference,
                            access_code: transaction.data.access_code
                        })
                        var savedbook = await book.save();

                        res.json({
                            status: true,
                            data:{
                                room: room,
                                savedbook
                            }
                        })
                    }
                }).catch(err=> console.log(err))
            }else{
                res.json("No room found")
            }
        }).catch(err=> console.log(err))
    } catch (error) {
        console.log(error),
        next(error)
    }
}

exports.hotelverify = async(req, res, next)=>{
    const ref = req.query.trxref;
    const userId = req.user.id
    try {
        await User.findOne({
            where: {
                id: userId
            }
        }).then(async (user) => {
            if(user){
                await Transaction.findOne({
                    where:{
                        ref_no: ref
                    }
                }).then(async (trn)=>{
                    if(trn){
                        res.json("Payment Already Verified")
                    }else{
                        paystack.transaction.verify(ref).then(async(transaction) => {
                            console.log(transaction);
                            // res.json(transaction)
                            if(!transaction){
                                res.json({
                                    status: false,
                                    message: `Transaction on the reference no: ${ref} not found`
                                })
                            }

                            var trnx = new Transaction({
                                userId: transaction.data.metadata.userId,
                                ref_no: ref,
                                status: transaction.data.status,
                                ProductType: "Hotel",
                                price: `${transaction.data.currency} ${transaction.data.amount / 100}`,
                                description: `${transaction.data.metadata.hotel} (${transaction.data.metadata.display_name})`
                            })
                            var savetrnx = await trnx.save()

                                await HotelBooking.findOne({
                                    where:{
                                        ref_no: ref
                                    }
                                }).then(async (book) => {
                                    if(book){
                                        await HotelBooking.update({
                                            transactionId: savetrnx.id
                                        }, { where: {
                                            id: book.id
                                        }})
                                    } else{
                                        res.json({
                                            status: false,
                                            message: "Booking Not Found"
                                        })
                                    }
                                }).catch(err => console.log(err))
                                    res.json({
                                        status: true,
                                        message: `Payment ${transaction.message}`,
                                        transaction: savetrnx,
                                    })

                                
                            
                        }).catch(error => console.error(error))
                    }
                }).catch(error => console.error(error))
            }
        }).catch(error => console.error(error))
    } catch (error) {
        console.error(error);
        next(error)
    }
}


