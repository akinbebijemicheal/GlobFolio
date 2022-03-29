const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config();

exports.RegisterUser = async (role, req, res) => {
    try{

        const {firstname, lastname, email, phone_no, country, serviceType, password } = req.body;

        let user = await User.findOne({
            where: {
                email: email 
                }
            });
        if(user) {
            return res.status(302).json({
                status: false,
                message: "user already exist"})
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
            role,
            password: hashedPass,
            verified: verify
        });
    
        await user.save();

        return res.status(201).json({
            status: true,
            message: 'account created'
        });

    } catch(error){
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "error occured",
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
                message: 'user does not exist',
                
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
                updatedAt: user.updatedAt,
                createdAt: user.createdAt,
                access_token: token
            };

            return res.status(200).json({
                
                status: true,
                message: "successfully logged in",
                data: result
                
            });

             

        } else{
           return res.status(403).json({
                status: false,
                message: 'wrong password',
                
            });
        }


    } catch(error){
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "error occured",
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
                message: 'user does not exist',
                
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
                message: "successfully logged in",
                data: result
                
            });

             

        } else{
           return res.status(403).json({
                status: false,
                message: 'wrong password',
                
            });
        }


    } catch(error){
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "error occured",
            error: error
        })
    }
};


exports.userAuth = passport.authenticate('jwt', {session: true});



exports.profile = user => {
   return {
        id: user.id,
        fullname: user.fullname,
        phone_no: user.phone_no,
        country: user.country,
        serviceType: user.serviceType,
        email: user.email,
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
       return res.status(200).json({
            status: true,
            message: "updated successfully"
        })
    } catch(error){
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "error occured",
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
            message: "updated successfully",
             
        })
    } catch(error){
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "error occured",
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

