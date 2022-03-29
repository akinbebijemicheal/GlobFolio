const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
require('dotenv').config();


exports.checkEmail = async(req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({ where: {
            email: `${email}`
        }})
        //console.log(user);
        if(user){
            const token = jwt.sign({email: email}, process.env.TOKEN, { expiresIn: "15m"});
            const link = `${process.env.BASE_URL}/reset-password/${user.id}/${token}`;
            //console.log(link);
            var transporter = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: process.env.E_USER,
                    pass: process.env.E_PASS
                }
            });

            const mailOptions = {
                from:  `${process.env.E_TEAM}`,
                to: `${user.email}`,
                subject: "Reset Password",
                html: `<h1> Hello ${user.fullname} </h1>  <p>Receiving this email means you requested to change you password, follow the link below to reset your password </p> <p> ${link} </p> <p> This link will expire in 15 minutes </p>  `
            };
            transporter.sendMail(mailOptions, function(err, info) {
                if(err){
                    console.log(err)
                } else {
                    console.log(info);
                    res.status(200).json({
                        status: true,
                        message: "An email has been sent to you, Check your inbox"
                    })
                }
            });

            
        } else {
            res.status(404).json({
                status: false,
                message: "User email not found"})
        }
    } catch (error) {
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "An error occured",
            error: error
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
                    res.status(200).json({ 
                        status: true,
                        message: "User password successfully updated"})
                } else {
                    res.status(406).json({
                        status: false,
                        message: "Password don't match"})
                }
            }else{
                res.status(403).json({
                    status: false,
                    message: "Invalid Link"
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
                    res.status(202).json({
                        status: true,
                        message: "Password updated"})
                }else{
                    res.status(406).json({
                        status: false,
                        message: "New password not equal to confirm password"})
                }
            } else{
                res.status(406).json({
                    status: false,
                    message: "Wrong password"})
            }
        }else{
            res.status(404).json({
                status: false,
                message: "User not logged in"})
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