require('dotenv').config()
const paystack = require('paystack')(process.env.PAYSTACK_SECRET);
const Rent = require('../model/renting');
const RentBooking = require('../model/rentbooking');
const Transaction = require('../model/usertransactions');
const User = require('../model/user')

exports.bookRent = async(req, res, next)=>{
    var {quantity, date, time, location}= req.body;
    const id = req.params.rentId;
    try {
        if(!quantity){
            quantity = 1
        }
        await Rent.findOne({
            where: {
                id: id
            }
        }).then(async(rent) => {
            if(rent && rent.available_rent >= 1){
                let fname = req.user.fullname.split(' ')
                paystack.transaction.initialize({
                    name: `${rent.title} (${rent.equipment})`,
                    email: req.user.email,
                    amount: parseInt(rent.price) * 100,
                    quantity: quantity,
                    callback_url: `${process.env.REDIRECT_SITE}/VerifyPay/rent`,
                    metadata: {
                        userId: req.user.id,
                        rent: rent.id,
                        title: rent.title,
                        equipment: rent.equipment
                                                 
                    }
                }).then(async (transaction)=>{
                    console.log(transaction)
                    if(transaction){
                        const book = new RentBooking({
                            buyerId: req.user.id,
                            rentId: rent.id,
                            quantity: quantity,
                            scheduled_date: date,
                            scheduled_time: time,
                            location: location,
                            transaction_url: transaction.data.authorization_url,
                            ref_no: transaction.data.reference,
                            access_code: transaction.data.access_code
                        })
                        var savedbook = await book.save();

                        res.json({
                            status: true,
                            data:{
                                rent: rent,
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

exports.rentVerify = async(req, res, next)=>{
    const ref = req.query.trxref;
    // const userId = req.user.id
    try {
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
                                ProductType: "Rent",
                                price: `${transaction.data.currency} ${transaction.data.amount / 100}`,
                                description: `${transaction.data.metadata.title} (${transaction.data.metadata.equipment})`
                            })
                            var savetrnx = await trnx.save()

                                await RentBooking.findOne({
                                    where:{
                                        ref_no: ref
                                    }
                                }).then(async (book) => {
                                    if(book){
                                        await RentBooking.update({
                                            transactionId: savetrnx.id
                                        }, { where: {
                                            id: book.id
                                        }})
                                    } else{
                                        res.json({
                                            status: false,
                                            message: "Rent Booking Not Found"
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
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getRentbookings = async(req, res, next)=>{
    try {
        await RentBooking.findAll({
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
                    model: Rent,
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
                    message: "No HOtel Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getUserRentbookings = async(req, res, next)=>{
    try {
        await RentBooking.findAll({
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
                    model: Rent,
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
                    message: "No HOtel Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getRentbooking = async(req, res, next)=>{
    try {
        await RentBooking.findOne({
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
                    model: Rent,
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
                    message: "No HOtel Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}




