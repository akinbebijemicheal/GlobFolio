const Subscription = require("../model/subscription");
const User = require("../model/user");
const Transaction = require('../model/transactions');
const VendorPlan = require('../model/Vendorplans');
require('dotenv').config()
const paystack = require('paystack')(process.env.PAYSTACK_SECRET);


exports.createPrice = async(req, res, next)=>{
    const {sub_type, price, interval, description} = req.body;
    try {
        await VendorPlan.findOne({
            where:{
                sub_type: sub_type
            }
        }).then(async (vendorplan) =>{
            if(vendorplan){
                res.json({
                    status: false,
                    message: "Price was already created for this plan"
                })
            }else{
                paystack.plan.create({
                    name: `${sub_type.toUpperCase()}`,
                    description: description,
                    amount: parseInt(price) * 100,
                    interval: `${interval}`,
                    invoice_limit: 0,
                    
                }).then(async (body) =>{
                    
                    paystack.page.create({
                        name:`${sub_type.toUpperCase()}`,
                        description: description,
                        plan: body.data.id,
                        amount: parseInt(price) * 100,
                        redirect_url: `${process.env.REDIRECT_SITE}/pay/verify`
                    }).then(async(pagebody) =>{
                        console.log(body)
                        console.log(pagebody)
                        
                        const setprice = new VendorPlan({
                            sub_type,
                            price,
                            interval,
                            plan_id: `${body.data.id}`,
                            plan_code: `${body.data.plan_code}`,
                            page_url: `https://paystack.com/pay/${pagebody.data.slug}`,
                            page_id: `${pagebody.data.id}`
                        })
                        const result = await setprice.save();
                        res.json({
                            status: true,
                            message: `Price set successfully`,
                            result
                        })
                    })
                       
                    
                }).catch((error) => console.error(error))
               
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.updatePrice = async(req, res, next)=>{
    const { sub_type, price, interval, description} = req.body;
    try {
        await VendorPlan.findOne({
            where:{
                sub_type: sub_type
            }
        }).then( async (vendorplan) =>{
            if(vendorplan){
                paystack.plan.update({
                    id: parseInt(vendorplan.plan_id),
                    name: `${sub_type.toUpperCase()}`,
                    amount: parseInt(price),
                    interval: `${interval}`,
                    description: description,
                    invoice_limit: 0,
                    
                    
                }).then(async(body) =>{

                    paystack.page.update({
                        id: parseInt(vendorplan.page_id),
                        name:`${sub_type.toUpperCase()}`,
                        description: description,
                        plan: body.data.id,
                        amount: parseInt(price) * 100,
                        redirect_url: `${process.env.REDIRECT_SITE}/pay/verify`

                    }).then(async(pagebody) =>{

                        await VendorPlan.update({
                            sub_type: sub_type,
                            price: price,
                            interval,
                            plan_id: `${body.data.id}`,
                            plan_code: `${body.data.plan_code}`,
                            page_url: `https://paystack.com/pay/${pagebody.data.slug}`,
                            page_id: `${pagebody.data.id}`
    
                        }, {
                            where:{
                                id: vendorplan.id
                            }
                        }).then((update) =>{
                            res.json({
                                status: true,
                                message: "Price Updated"
                            })
                        }).catch(err=> console.log(err))

                        
                    }).catch(err=> console.log(err))
                    
                }).catch(err=> console.log(err))
            
            }else{
                res.json({
                    status: false,
                    message: "Subscription type not found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.deletePrice = async(req, res, next)=>{
    
    try {
        await VendorPlan.findOne({
            where: {
                id: req.params.id
            }
        }).then( async(price) =>{
            if(price){
                await Subprice.destroy({
                    where: {
                        id: price.id
                    }
                })
                res.json({
                    status: true,
                    message: "Subscription type deleted but you need to also delete it via paystack dashboard"
                })
            }else{
                res.json({
                    status: false,
                    message: "Subscription type not found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}


exports.getSubPrice = async(req, res, next)=>{
    const sub_type = req.query.sub
    try {
        if(!sub_type){
            var prices = await VendorPlan.findAll()
            res.json(prices);
        }else{
            var prices = await VendorPlan.findOne({
                where:{
                    sub_type:sub_type
                }
            })
            res.json(prices);
        }
        
    } catch (error) {
        console.log(error);
        next(error)
    }
}


exports.verify = async(req, res, next)=>{
    const ref = req.query.reference;
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
                            if(!transaction){
                                res.json({
                                    status: false,
                                    message: `Transaction on the reference no: ${ref} not found`
                                })
                            }

                            var created_date = new Date(transaction.data.created_at);
                            if(transaction.data.plan_object.interval === 'daily'){
                                var days = 1    
                                
                            }else if(transaction.data.plan_object.interval === 'weekly'){
                                days = 7;
                                
                            }else if(transaction.data.plan_object.interval === 'monthly'){
                                days = 30;
                                
                            }else if(transaction.data.plan_object.interval === 'quaterly'){
                                days = 90;
                                
                            }else if(transaction.data.plan_object.interval === 'annually'){
                                days = 365;
                                
                            }else if(transaction.data.plan_object.interval === 'biannually'){
                                days = 730;
                                
                            }
                            created_date.setDate(created_date.getDate() + days)

                            var trnx = new Transaction({
                                userId: req.user.id,
                                ref_no: ref,
                                status: transaction.data.status,
                                sub_type: `${transaction.data.plan_object.name}`,
                                price: `${transaction.data.plan_object.currency} ${transaction.data.plan_object.amount / 100}`,
                                interval: transaction.data.plan_object.interval,
                                start_date: transaction.data.created_at,
                                end_date: `${created_date.toISOString()}`
                            })
                            var savetrnx = await trnx.save()

                            await Subscription.findOne({
                                where:{
                                    userId: req.user.id
                                }
                            }).then(async (sub) =>{
                                if(sub){
                                    if(sub.expire_date > (new Date()).toISOString()){
                                            var someDate = new Date(`${sub.expire_date}`);
                                            someDate.setDate(someDate.getDate() + days)
                                            var end_date = someDate.toISOString()
                                    }else{
                                        end_date = `${created_date.toISOString()}`
                                    }

                                    await Subscription.update({
                                        sub_type: savetrnx.sub_type.toLowerCase(),
                                        status: "active",
                                        end_date: end_date
                                    }, {
                                        where: {
                                            userId: req.user.id
                                        }
                                    })

                                    res.json({
                                        status: true,
                                        message: `Payment ${transaction.message}`,
                                        transaction: savetrnx,
                                    })

                                }
                            }).catch(err => console.error(err))
                        })
                    }
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}


exports.addSubscription = async(req, res) => {
    const sub_type = req.body;
    try {


        var date;
        
        if(sub_type === 'free'){
            date = 7; 
        }else if( sub_type === "basic"){
            date = 30;
            
        }else if(sub_type === "standard"){
            date = 180;
            
        }else if(sub_type === "premium"){
            date = 365;
            
        }

        await Subscription.findOne({where: {
            userid: req.user.id
        }}).then(async(subscription) => {

            if(subscription){
                if(subscription.expire_date !== null){
                    var someDate = new Date(`${subscription.expire_date}`);
                } else{
                    someDate = new Date()
                }
                someDate.setDate(someDate.getDate() + date); //number  of days to add, e.x. 15 days
                var dateFormated = someDate.toISOString().substr(0,10);
                
                await Subscription.update({
                    sub_type: sub_type,
                    expire_date: dateFormated

                }, {where: {
                    userid: req.user.id
                }})

                res.status(200).json({
                    status: true,
                    message: `Successfully subscribed to ${sub_type.toUpperCase()} Plan`
                })

            }else{
                someDate = new Date();
                someDate.setDate(someDate.getDate() + date); //number  of days to add, e.x. 15 days
                dateFormated = someDate.toISOString().substr(0,10);
                Subscription.create({
                    userid: req.user.id,
                    sub_type: sub_type,
                    expire_date: dateFormated
                })
                res.status(201).json({
                    status: true,
                    message: `Successfully subscribed to ${sub_type.toUpperCase()} Plan`
                })
            }
               
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "Error occured",
             error: error
         })
    }
}