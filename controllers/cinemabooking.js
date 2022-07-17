require('dotenv').config()
const paystack = require('paystack')(process.env.PAYSTACK_SECRET);
const Cinema = require('../model/cinema');
const CinemaBooking = require('../model/cinemabooking');
const Transaction = require('../model/usertransactions');
const User = require('../model/user')

exports.bookCinema = async(req, res, next)=>{
    var {quantity, date, time}= req.body;
    const id = req.params.cinemaId;
    try {
        if(!quantity){
            quantity = 1
        }
        await Cinema.findOne({
            where: {
                id: id
            }
        }).then(async(cinema) => {
            if(cinema && cinema.seat >= 1){
                let fname = req.user.fullname.split(' ')
                paystack.transaction.initialize({
                    name: `${cinema.title}`,
                    email: req.user.email,
                    amount: (parseInt(cinema.price) * quantity) * 100,
                    quantity: quantity,
                    callback_url: `${process.env.REDIRECT_SITE}/VerifyPay/cinema`,
                    metadata: {
                        userId: req.user.id,
                        cinema: cinema.id,
                        title: cinema.title,
                       
                                                 
                    }
                }).then(async (transaction)=>{
                    console.log(transaction)
                    if(transaction){
                        const book = new CinemaBooking({
                            buyerId: req.user.id,
                            cinemaId: cinema.id,
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

exports.cinemaVerify = async(req, res, next)=>{
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
                                ProductType: "Rent",
                                price: `${transaction.data.currency} ${transaction.data.amount / 100}`,
                                description: `${transaction.data.metadata.title}`
                            })
                            var savetrnx = await trnx.save()
                            verify = "Payment" +" " +transaction.message

                            var cinema = await Cinema.findOne({
                                where:{
                                    id: transaction.data.metadata.cinema
                                }
                            })
                                await CinemaBooking.findOne({
                                    where:{
                                        ref_no: ref
                                    }
                                }).then(async (book) => {
                                    if(book){
                                        await CinemaBooking.update({
                                            transactionId: savetrnx.id
                                        }, { where: {
                                            id: book.id
                                        }})

                                        await Cinema.update({
                                            seat: (cinema.seat - book.quantity)
                                        }, {
                                            where:{
                                                id: cinema.id
                                            }
                                        })
                                    } 
                                }).catch(err => console.log(err))
                                    // res.json({
                                    //     status: true,
                                    //     message: `Payment ${transaction.message}`,
                                    //     transaction: savetrnx,
                                    // })
                            
                                    res.render("base/verify-cinema",{
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

exports.getCinemabookings = async(req, res, next)=>{
    try {
        await CinemaBooking.findAll({
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
                    model: Cinema,
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
                    message: "No Cinema Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getUserCinemabookings = async(req, res, next)=>{
    try {
        await CinemaBooking.findAll({
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
                    model: Cinema,
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
                    message: "No Cinema Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getCinemabooking = async(req, res, next)=>{
    try {
        await CinemaBooking.findOne({
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
                    model: Cinema,
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
                    message: "No Cinema Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}




