const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config();
const nodemailer = require('nodemailer')
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

exports.RegisterUser = async (role, req, res) => {
    try{

        const {firstname, lastname, email, phone_no, country, business, serviceType, password } = req.body;

        let user = await User.findOne({
            where: {
                email: email 
                }
            });
        if(user) {
            return res.status(302).json({
                status: false,
                message: "User already exist"})
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);
        
        if( role === 'user' || 'admin'){
            var verify = true
        }
        if(role === 'vendor'){
            var verify = false
        }

        user = new User({
            fullname: `${firstname} ${lastname}`,
            email,
            phone_no,
            country,
            serviceType,
            business,
            role,
            password: hashedPass,
            verified: verify
        });
    
        await user.save();

         user = await User.findOne({ where: {
            email: email
        }})
        
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
            
            let fname = user.fullname.split(' ')
            const mailOptions = {
                from:  `${process.env.E_TEAM}`,
                to: `${user.email}`,
                subject: "Email Verification",
                html: `
                <h2> Hi ${fname[0]}, </h2>
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
                    return res.status(201).json({
                        status: true,
                        message: "Account created and An email has been sent to you, Check your inbox"
                    })
                }
            });

    }catch(error){
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "Error occured",
             error: error
         })
    }
};


exports.LoginUser = async (role, req, res) => {
    try{

        const {email, password } = req.body;
        const user = await User.findOne({where: {
            email: email }
        });
        if(!user){
            return res.status(404).json({
                status: false,
                message: 'User does not exist',
                
            });
        }

        if(user.role !== role){
            return res.status(401).json({
                status: false,
                message: "Please ensure you are logging-in from the right portal",
                
            });
        }
        
        const validate = await bcrypt.compare(password, user.password);
        if(validate){

            const payload = {
                user: user
            }

            let token = jwt.sign(payload, process.env.TOKEN, { expiresIn: 24 * 60 * 60});

            let result = {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                phone_no: user.phone_no,
                country: user.country,
                serviceType: user.serviceType,
                address: user.address,
                expiresIn: '24 hours',
                verified: user.verified,
                sub_status: user.sub_status,
                email_verify: user.email_verify,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt,
                access_token: token
            };

            return res.status(200).json({
                
                status: true,
                message: "Successfully logged in",
                data: result
                
            });

             

        } else{
           return res.status(403).json({
                status: false,
                message: 'Wrong password',
                
            });
        }


    } catch(error){
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "Error occured",
            error: error
        })
    }
};

exports.webLoginUser = async (role, req, res) => {
    try{

        const {email, password } = req.body;
        const user = await User.findOne({where: {
            email: email }
        });
        if(!user){
            return res.status(404).json({
                status: false,
                message: 'User does not exist',
                
            });
        }

        if(user.role !== role){
            return res.status(401).json({
                status: false,
                message: "Please ensure you are logging-in from the right portal",
                
            });
        }
        
        const validate = await bcrypt.compare(password, user.password);
        if(validate){

            let token = jwt.sign(
                { 
                fullname: user.fullname,
                email: user.email,
                role: user.role, 
                id: user.id}, 
                process.env.TOKEN, { expiresIn: 24 * 60 * 60});

            let result = {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                phone_no: user.phone_no,
                country: user.country,
                serviceType: user.serviceType,
                address: user.address,
                expiresIn: '24 hours',
                verified: user.verified,
                email_verify: user.email_verify,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt,
            };

            var option = {
                httpOnly: true,
                signed: true,
                sameSite: true,
                secure: (process.env.NODE_ENV !== 'development'),
                secret: process.env.CSECRET
            }
            
            res.cookie("jwt", token, option);

            return res.status(200).json({
                
                status: true,
                message: "Successfully logged in",
                data: result
                
            });

             

        } else{
           return res.status(403).json({
                status: false,
                message: 'Wrong password',
                
            });
        }


    } catch(error){
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "Error occured",
            error: error
        })
    }
};


exports.userAuth = passport.authenticate('jwt', {session: false});



exports.profile = user => {
   return {
        id: user.id,
        fullname: user.fullname,
        phone_no: user.phone_no,
        country: user.country,
        serviceType: user.serviceType,
        email: user.email,
        sub_status: user.sub_status,
        address: user.address,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
       };

};


exports.getUsers = async (req, res)=>{
    try {
        const users = await User.findAll({where: {role: 'user'}})
        if (users){
            return res.status(200).json({
                status: true,
                data: users})
        } else{
            return res.status(404).json({
                status: false,
                message: "No user found"})
        }
       
    } catch (error) {
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "error occured",
             error: error
         })
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findOne({where: 
            { 
                username: req.params.username
            }
        })
        if (user){
            return res.status(200).json({
                status: true,
                message: user})
        } else{
            return res.status(404).json({
                status: false,
                message: "No user found"})
        }

    } catch (error) {
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "error occured",
            error: error
        })
    }
};

exports.updateUser = async(req, res) => {
    //const { fullname, email, phone_no, country, serviceType} = req.body
    try{
        await User.update( /* {
            fullname: fullname,
            phone_no: phone_no,
            country: country,
            serviceType: serviceType,
            email: email,
        }*/ req.body, { where: 
            {
            email: req.user.email
            }
        });

        const user = await User.findOne({
            where: {
                email: req.user.email
            }
        })
       return res.status(200).json({
            status: true,
            message: "Updated successfully",
            data: user
        })
    } catch(error){
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "Error occured",
            error: error
        })
    }
}

exports.deleteUser = async(req, res) => {
    try{
        const user = await User.destroy({ where: {
            email: req.user.email}
        });
        
        return res.status(200).json({
            status: true,
            message: "Updated successfully",
             
        })
    } catch(error){
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "Error occured",
            error: error
        })
    }
};

exports.checkRole = roles => (req, res, next) => {
if(!roles.includes(req.user.role)){ 
    return res.status(401).json({
        status: false,
        message: "Unauthorized"}) 
    }
   return next();
};

