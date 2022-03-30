const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
require('dotenv').config();
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const myOAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    )

myOAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
});

const myAccessToken = myOAuth2Client.getAccessToken()

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
                    service: 'gmail',
                    auth: {
                      type: 'OAuth2',
                      user: process.env.E_USER,
                      clientId: process.env.CLIENT_ID,
                      clientSecret: process.env.CLIENT_SECRET,
                      refreshToken: process.env.REFRESH_TOKEN,
                      accessToken: myAccessToken
                    }
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
                subject: "Email Verification",
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

exports.emailVerification_V2 = async(req, res) => {
try {
        const token = req.params.token;
        const decode = jwt.verify(token, process.env.TOKEN);
        if(decode){
                await User.update({email_verify: true}, {where: {
                    id: `${req.params.id}`
                }})
                res.status(200).json({ 
                    status: true,
                    message: "Email Verified successfully updated"})
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
                    service: 'gmail',
                    auth: {
                      type: 'OAuth2',
                      user: process.env.E_USER,
                      clientId: process.env.CLIENT_ID,
                      clientSecret: process.env.CLIENT_SECRET,
                      refreshToken: process.env.REFRESH_TOKEN,
                      accessToken: myAccessToken
                    }
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
                subject: "Reset Password",
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