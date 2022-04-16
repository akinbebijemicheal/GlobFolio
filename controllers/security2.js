const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
require('dotenv').config();
/*const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const myOAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    )

myOAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
});

const myAccessToken = myOAuth2Client.getAccessToken()*/

exports.emailVerification_V1 = async(req, res) => {
    try {
        const user = await User.findOne({ where: {
            email: req.user.email
        }})
        if(user){
            const token = jwt.sign({email: user.email}, process.env.TOKEN, { expiresIn: "15m"});
            const link = `${process.env.BASE_URL}/email-verification/${user.id}/${token}`;

            if( process.env.ONTEST === 'REAL'){
                var transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                        port: process.env.EMAIL_PORT,
                        secure: true, // true for 465, false for other ports
                        tls: {
                        rejectUnauthorized: false,
                        },
                        auth: {
                        user: process.env.EMAIL_USERNAME, // generated ethereal user
                        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
                        },
                  });
            } else{
                var transporter = nodemailer.createTransport({
                    host: process.env.SMTP,
                    port: process.env.SMTPPORT,
                    auth: {
                        user: process.env.MAILTRAP_USER,
                        pass: process.env.MAILTRAP_PASS
                    }
                });
            }
            
            const firstname = user.fullname.split(' ')
            const mailOptions = {
                from:  `${process.env.E_TEAM}`,
                to: `${user.email}`,
                subject: "Deepend Email Verification",
                html: `
                <h2> Hi ${firstname[0]}, </h2>
                <p> Thanks for getting started with Deepend! </p>
                <p> We need a little more information to complete your registration, including a confirmation of your email address. </p>
                <p> Click below to confirm your email address: </p>
                <a href = ${link}> Verify Email </a>               
                <p> If you have problems, please paste the below URL into your web browser. </p>
                <p>  ${link} </p>
                <p> PLEASE NOTE: This link will expire in 15 minutes </p> `
            };

            transporter.sendMail(mailOptions, function(err, info) {
                if(err){
                    console.log(err)
                    req.flash("error", "An error occured refresh the page")
                } else {
                    console.log(info);
                    res.status(200)
                    req.flash(
                         "success","An email has been sent to you, Check your inbox"
                    )
                }
            });

            
        } else {
            res.status(404)
            req.flash("warning", "User email not found")
        }
    } catch (error) {
        console.error(error)
        res.status(500)
       req.flash("error", "An error occured refresh the page")
    }
};

exports.emailVerification_V2 = async(req, res) => {
try {
        const token = req.params.token;
        const decode = jwt.verify(token, process.env.TOKEN);
        if(decode){
                await User.update({email_verify: true}, {where: {
                    id: `${req.params.id}`
                }})
                res.status(200)
                req.flash("success", "Email Verified successfully updated")
        }else{
            res.status(403)
            req.flash("error", "Invalid Link"
            )
        }
    } catch (error) {
        console.error(error)
        res.status(500)
        req.flash("error", "An error occured refresh the page")
}

}


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
            if( process.env.ONTEST === 'REAL'){
                var transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                        port: process.env.EMAIL_PORT,
                        secure: true, // true for 465, false for other ports
                        tls: {
                        rejectUnauthorized: false,
                        },
                        auth: {
                        user: process.env.EMAIL_USERNAME, // generated ethereal user
                        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
                        },
                  });
            } else{
                var transporter = nodemailer.createTransport({
                    host: process.env.SMTP,
                    port: process.env.SMTPPORT,
                    auth: {
                        user: process.env.MAILTRAP_USER,
                        pass: process.env.MAILTRAP_PASS
                    }
                });
            }

            var firstname = user.fullname.split(' ');
            const mailOptions = {
                from:  `${process.env.E_TEAM}`,
                to: `${user.email}`,
                subject: "Deepend Reset Password",
                html: `
                <h2> Hello ${firstname[0]}, </h2>
                <p> Somebody requested a new password for the Deepend account associated with ${user.email}. </p>
                <p> No changes have been made to your account yet. </p>
                <p> You can reset your password by clicking the link below: </p>
                <a href = ${link}> Reset Password </a>
                <p>PLEASE NOTE: This link will expire in 15 minutes </p> 
                <p> If you did not request a new password, please let us know immediately by replying to this email. </p>
                Yours, <br>
                The Deepend team 
                `
            };
            transporter.sendMail(mailOptions, function(err, info) {
                if(err){
                    console.log(err)
                    req.flash("error", "An error occured refresh the page")
                } else {
                    console.log(info);
                    res.status(200)
                    req.flash(
                         "success","An email has been sent to you, Check your inbox"
                    )
                }
            });

            
        } else {
            res.status(404)
            req.flash("error", "User email not found")
        }
    } catch (error) {
        console.error(error)
        res.status(500)
        req.flash("error", "An error occured refresh the page")
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
                    res.status(200)
                    req.flash("success", "User password successfully updated")
                } else {
                    res.status(406)
                    req.flash("error", "Password don't match")
                }
            }else{
                res.status(403)
                req.flash("error", "Invalid Link"
                )
            }
           
        
        } catch (error) {
            console.error(error)
            res.status(500)
            req.flash("error", "An error occured refresh the page")
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
                    res.status(202)
                    req.flash("success", "Password updated")
                }else{
                    res.status(406)
                    req.flash("warning", "New password not equal to confirm password")
                }
            } else{
                res.status(406)
                req.flash( "error", "Wrong password")
            }
        }else{
            res.status(404)
            req.flash("error", "User not logged in")
        }
    } catch (error) {
        console.error(error)
        res.status(500)
        req.flash("error", "An error occured refresh the page")
    }
}