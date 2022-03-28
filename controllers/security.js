const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
require('dotenv').config();
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;


let Auth = new OAuth2(
    "268413882311-o45lkpk5ob5lbgrocemku281umttkcb1.apps.googleusercontent.com",
    "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",
)

Auth.setCredentials({
    refresh_token: "1//049Fk9ubBjBukCgYIARAAGAQSNwF-L9IrfolI7eSMNl6evKu8SBPIKx3uHkDbFct8sIdkUPOk3Q6Ec_-oAnOfm_Wzpc8IE7AcfJE"
})

var AccessToken = Auth.getAccessToken();

exports.checkEmail = async(req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({ where: {
            email: `${email}`
        }})
        console.log(user);
        if(user){
            const token = jwt.sign({email: email}, process.env.TOKEN, { expiresIn: "15m"});
            const link = `${process.env.BASE_URL}/reset-password/${user.id}/${token}`;
            //console.log(link);

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: "OAuth2",
                    user: process.env.E_USER,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: process.env.REFRESH_TOKEN,
                    accessToken: AccessToken
                }
            });

            const mailOptions = {
                from:  `${process.env.E_USER}`,
                to: `${user.email}`,
                subject: "Reset Password",
                html: `<h1> Hello ${user.fullname} </h1>  <p>Receiving this email means you requested to change you password, follow the link below to reset your password </p> <p> ${link} </p> <p> This link will expire in 15 minutes </p>  `
            };
            transporter.sendMail(mailOptions, function(err, info) {
                if(err){
                    console.log(err)
                    res.status(400).json({
                        status: false,
                        msg: "An error has occured"
                    })
                } else {
                    //console.log(info);
                    res.status(200).json({
                        status: true,
                        msg: "An email has been sent to you, Check your inbox"
                    })
                }
            });

            
        } else {
            res.status(404).json("User email not found")
        }
    } catch (error) {
        console.error(error)
       return res.status(500).json({
            message: "error occured",
            error
        })
    }
};


exports.forgotPassword = async(req, res) => {
        const {new_password, confirm_password} = req.body;
    try {
            const token = req.params.token;
            const decode = jwt.verify(token, process.env.TOKEN);
            if(decode){
                if( new_password === confirm_password){
                    const salt = await bcrypt.genSalt(12);
                    const hashedPass = await bcrypt.hash(new_password, salt);
                    
                    await User.update({password: hashedPass}, {where: {
                        id: `${req.params.id}`
                    }})
                    res.status(200).json({ msg: "User password successfully updated"})
                } else {
                    res.status(406).json({msg: "Password don't match"})
                }
            }else{
                res.status(403).json({
                    msg: "Invalid Link"
                })
            }
           
        
        } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "error occured",
             error
         })
    }

}

exports.changePassword = async(req, res) => {
    const { password, new_password, confirm_password} = req.body;
    try { 
        const user = await User.findOne({where: {
            id: req.user.id
        }})
        if(user){
            const validate = await bcrypt.compare(password, user.password);
            if(validate){
                if(new_password === confirm_password){
                    const salt = await bcrypt.genSalt(12);
                    const hashedPass = await bcrypt.hash(new_password, salt);
                    
                    await User.update({password: hashedPass}, {where: {
                        id: user.id
                    }})
                    res.status(202).json("password updated")
                }else{
                    res.status(406).json("new password not equal to confirm password")
                }
            } else{
                res.status(406).json("wrong password")
            }
        }else{
            res.status(404).json("user not logged in")
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             message: "error occured",
             error
         })
    }
}