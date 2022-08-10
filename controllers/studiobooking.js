require('dotenv').config()
const paystack = require('paystack')(process.env.PAYSTACK_SECRET);
const Studio = require('../model/studio_book');
const StudioBooking = require('../model/studiobooking');
const Transaction = require('../model/usertransactions');
const store = require('store')
const User = require('../model/user');
const nodemailer = require("nodemailer");
const Fee = require("../model/adminFee");
const baseurl = process.env.BASE_URL

var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    tls: {
    rejectUnauthorized: false,
    },
    ool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5,
    auth: {
    user: process.env.EMAIL_USERNAME, // generated ethereal user
    pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });


  exports.bookStudio = async(req, res, next)=>{
    var {quantity, dateTo, dateFrom}= req.body;
    const id = req.params.studioId;
    try {
        if(!quantity){
            quantity = 1
        }

        var commision = await Fee.findOne({
            where:{
                type: "commission"
            }
        })
        await Studio.findOne({
            where: {
                id: id
            }
        }).then(async(studio) => {
            if(studio){
                let fname = req.user.fullname.split(' ');
                var amounttopay = (parseInt(studio.price) * quantity);
                var charge = parseInt((commision.value / 100) * (parseInt(studio.price) * quantity))
                var amount = amounttopay + charge;
                var userId = req.user.id;
                var title = studio.title;
                var email = req.user.email;
                var buyerId = req.user.Id;
                var equipment = studio.equipment;
                var studioId = studio.id;
                
                       

                        res.json({
                            status: true,
                            data:{
                                charge: charge,
                                userId: userId,
                                email: email,
                                amount: amount,
                                buyerId: buyerId,
                                studioId: studioId,
                                title: title,
                                quantity: quantity,
                                dateFrom: dateFrom,
                                dateTo: dateTo,
                                equipment: studio.equipmet
                            }
                        })
                  
            }else{
                res.json({
                    status: false,
                    message: "No studio found or studio not available"
                })
            }
        }).catch(err=> console.log(err))
    } catch (error) {
        console.error(error);
        next(error)
    }
};

exports.getPaymentStudio = async(req, res, next)=>{
    var {dateTo, dateFrom, charge, userId, studioId, title, email, amount, buyerId, quantity, ref_no, authorization_url}= req.body;

    const id = req.params.studioId;
    try {
        if(!quantity){
            quantity = 1
        }

        var commision = await Fee.findOne({
            where:{
                type: "commission"
            }
        })
        await Studio.findOne({
            where: {
                id: id
            }
        }).then(async(studio) => {
            if(studio){
                let fname = req.user.fullname.split(' ');
               
                        const book = new StudioBooking({
                            buyerId: buyerId,
                            studioId: studio.id,
                            quantity: quantity,
                            start_date: dateFrom,
                            end_date: dateTo,
                            transaction_url: authorization_url,
                            ref_no: ref_no,
                            commission: charge
                        })
                        var savedbook = await book.save();
                        console.log(book)


                        next()
                 
            }else{
                res.json({
                    status: false,
                    message: "No studio found or studio not available"
                })
            }
        }).catch(err=> console.log(err))
    } catch (error) {
        console.error(error);
        next(error)
    }
};

exports.studioVerify = async(req, res, next)=>{
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
                        paystack.transaction.verify(ref)
                        .then(async(transaction) => {
                            console.log(transaction);
                            // res.json(transaction)
                            if(!transaction){
                                verify = `Transaction on the reference no: ${ref} not found`
                                // res.json({
                                //     status: false,
                                //     message: `Transaction on the reference no: ${ref} not found`
                                // })
                            }

                            var book = await StudioBooking.findOne({
                                where:{
                                    ref_no: ref
                                }
                            })

                            var trnx = new Transaction({
                                userId: transaction.data.metadata.meta.userId,
                                ref_no: ref,
                                status: transaction.data.status,
                                ProductType: "Studio",
                                price: `${transaction.data.currency} ${transaction.data.amount / 100}`,
                                description: `Studio Booking #${book.id}, ${transaction.data.metadata.meta.title} (${transaction.data.metadata.meta.equipment})`
                            })
                            var savetrnx = await trnx.save()
                            verify = "Payment" +" " +transaction.message

                            
                                await StudioBooking.findOne({
                                    where:{
                                        ref_no: ref
                                    }
                                }).then(async (book) => {
                                    if(book){
                                        await StudioBooking.update({
                                            transactionId: savetrnx.id
                                        }, { where: {
                                            id: book.id
                                        }})
                                    }
                                }).catch(err => console.log(err))
                                    // res.json({
                                    //     status: true,
                                    //     message: `Payment ${transaction.message}`,
                                    //     transaction: savetrnx,
                                    // })
                            
                                    var user = await User.findOne({
                                        where:{
                                            id: transaction.data.metadata.meta.userId,
                                        }
                                    })
                
                                    let fname = user.fullname.split(' ')
                                    const mailOptions = {
                                        from:  `"Deepend" <${process.env.E_TEAM}>`,
                                        to: `${user.email}`,
                                        subject: "Deepend",
                                        html: `
                                <!DOCTYPE html>
                                    <html>
                                    <head>
                
                                    <meta charset="utf-8">
                                    <meta http-equiv="x-ua-compatible" content="ie=edge">
                                    <title>${savetrnx.ProductType} Payment Confirmation</title>
                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                    <style type="text/css">
                                    /**
                                     * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
                                     */
                                    @media screen {
                                        @font-face {
                                        font-family: 'Source Sans Pro';
                                        font-style: normal;
                                        font-weight: 400;
                                        src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
                                        }
                                        @font-face {
                                        font-family: 'Source Sans Pro';
                                        font-style: normal;
                                        font-weight: 700;
                                        src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
                                        }
                                    }
                                    /**
                                     * Avoid browser level font resizing.
                                     * 1. Windows Mobile
                                     * 2. iOS / OSX
                                     */
                                    body,
                                    table,
                                    td,
                                    a {
                                        -ms-text-size-adjust: 100%; /* 1 */
                                        -webkit-text-size-adjust: 100%; /* 2 */
                                    }
                                    /**
                                     * Remove extra space added to tables and cells in Outlook.
                                     */
                                    table,
                                    td {
                                        mso-table-rspace: 0pt;
                                        mso-table-lspace: 0pt;
                                    }
                                    /**
                                     * Better fluid images in Internet Explorer.
                                     */
                                    img {
                                        -ms-interpolation-mode: bicubic;
                                    }
                                    /**
                                     * Remove blue links for iOS devices.
                                     */
                                    a[x-apple-data-detectors] {
                                        font-family: inherit !important;
                                        font-size: inherit !important;
                                        font-weight: inherit !important;
                                        line-height: inherit !important;
                                        color: inherit !important;
                                        text-decoration: none !important;
                                    }
                                    /**
                                     * Fix centering issues in Android 4.4.
                                     */
                                    div[style*="margin: 16px 0;"] {
                                        margin: 0 !important;
                                    }
                                    body {
                                        width: 100% !important;
                                        height: 100% !important;
                                        padding: 0 !important;
                                        margin: 0 !important;
                                    }
                                    /**
                                     * Collapse table borders to avoid space between cells.
                                     */
                                    table {
                                        border-collapse: collapse !important;
                                    }
                                    a {
                                        color: #1a82e2;
                                    }
                                    img {
                                        height: auto;
                                        line-height: 100%;
                                        text-decoration: none;
                                        border: 0;
                                        outline: none;
                                    }
                                    </style>
                
                                    </head>
                                    <body style="background-color: #e9ecef;">
                
                                    <!-- start preheader -->
                                    <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
                                        ${savetrnx.ProductType} Payment confirmation
                                    </div>
                                    <!-- end preheader -->
                
                                    <!-- start body -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                
                                        <!-- start logo -->
                                        <tr>
                                        <td align="center" bgcolor="#e9ecef">
                                            <!--[if (gte mso 9)|(IE)]>
                                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                                            <tr>
                                            <td align="center" valign="top" width="600">
                                            <![endif]-->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                            <tr>
                                                <td align="center" valign="top" style="padding: 36px 24px;">
                                                <a href=${baseurl} target="_blank" style="display: inline-block;">
                                                    <img src=${baseurl}/images/deep.png alt="Logo" border="0" width="60" style="display: flex; width: 60px; max-width: 60px; min-width: 60px;">
                                                </a>
                                                </td>
                                            </tr>
                                            </table>
                                            <!--[if (gte mso 9)|(IE)]>
                                            </td>
                                            </tr>
                                            </table>
                                            <![endif]-->
                                        </td>
                                        </tr>
                                        <!-- end logo -->
                
                                        <!-- start hero -->
                                        <tr>
                                        <td align="center" bgcolor="#e9ecef">
                                            <!--[if (gte mso 9)|(IE)]>
                                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                                            <tr>
                                            <td align="center" valign="top" width="600">
                                            <![endif]-->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                            <tr>
                                                <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                                                <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">${savetrnx.ProductType} Payment confirmation</h1>
                                                </td>
                                            </tr>
                                            </table>
                                            <!--[if (gte mso 9)|(IE)]>
                                            </td>
                                            </tr>
                                            </table>
                                            <![endif]-->
                                        </td>
                                        </tr>
                                        <!-- end hero -->
                
                                        <!-- start copy block -->
                                        <tr>
                                        <td align="center" bgcolor="#e9ecef">
                                            <!--[if (gte mso 9)|(IE)]>
                                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                                            <tr>
                                            <td align="center" valign="top" width="600">
                                            <![endif]-->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                
                                            <!-- start copy -->
                                            <tr>
                                                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                                        <h2> Hi ${fname[0]}, </h2>        
                                                <p style="margin: 0;"> Receiving this email means, you have just purchased ${savetrnx.ProductType} from Deepend and your was confrimed</p>
                                                <br>
                                                <p style="margin: 0;"><b>Payment Details: </b></p>
                                                <br>
                                                <p style="margin: 0;">Description: ${savetrnx.description} </p>
                                                <p style="margin: 0;">Reference number: ${savetrnx.ref_no} </p>
                                                <p style="margin: 0;">Payment Status: <b>${savetrnx.status.toUpperCase()}</b> </p>
                                                <p style="margin: 0;">Price: ${savetrnx.price} </p>
                                                </td>
                                            </tr>
                                            <!-- end copy -->
                
                                         <!-- start copy -->
                                            <tr>
                                                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                                                <p style="margin: 0;">Cheers,<br> Deepend Team</p>
                                                </td>
                                            </tr>
                                            <!-- end copy -->
                
                                            </table>
                                            <!--[if (gte mso 9)|(IE)]>
                                            </td>
                                            </tr>
                                            </table>
                                            <![endif]-->
                                        </td>
                                        </tr>
                                        <!-- end copy block -->
                
                                        <!-- start footer -->
                                        <tr>
                                        <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                                            <!--[if (gte mso 9)|(IE)]>
                                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                                            <tr>
                                            <td align="center" valign="top" width="600">
                                            <![endif]-->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                
                                            <!-- start permission -->
                                            <tr>
                                                <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                                                <p style="margin: 0;">You received this email because we received a payment confirmation from your DEEPEND account.</p>
                                                </td>
                                            </tr>
                                            <!-- end permission -->
                
                                            </table>
                                            <!--[if (gte mso 9)|(IE)]>
                                            </td>
                                            </tr>
                                            </table>
                                            <![endif]-->
                                        </td>
                                        </tr>
                                        <!-- end footer -->
                
                                    </table>
                                    <!-- end body -->
                
                                    </body>
                                    </html>`
                            };
                
                            transporter.sendMail(mailOptions, function(err, info) {
                                if(err){
                                    console.log(err)
                                } else {
                                    console.log(info);
                                }
                            });
                

                                    res.render("base/verify-studio",{
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

exports.getStudiobookings = async(req, res, next)=>{
    try {
        await StudioBooking.findAll({
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
                    model: Studio,
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
                console.log("Bookings found")
                store.set("book", JSON.stringify(book));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("book"));
                      console.log(data)
                      res.render("dashboard/admin/studio-recent-bookings", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data: data
                      });
                      next();
            }else{
                console.log("No bookings found")
                store.set("book", JSON.stringify(book));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("book"));
                      console.log(data)
                      res.render("dashboard/admin/studio-recent-bookings", {
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

exports.getUserStudiobookings = async(req, res, next)=>{
    try {
        await StudioBooking.findAll({
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
                    model: Studio,
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
                    message: "No Studio Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getAppStudiobooking = async(req, res, next)=>{
    try {
        await StudioBooking.findOne({
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
                    model: Studio,
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
                    message: "No Studio Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}

exports.getStudiobooking = async(req, res, next)=>{
    try {
        await StudioBooking.findOne({
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
                    model: Studio,
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
                    message: "No Studio Booking Available"
                })
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}




