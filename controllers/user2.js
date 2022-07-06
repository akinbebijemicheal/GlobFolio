const User = require('../model/user');
const Restaurant = require('../model/restuarant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config();
const nodemailer = require('nodemailer')
const baseurl = process.env.BASE_URL

exports.RegisterUser = async (role, req, res, next) => {
    try{

        const {email, password } = req.body;

        let user = await User.findOne({
            where: {
                email: email 
                }
            });
        if(user) {
            res.status(302).json({
                status: false,
                message: "User already exist"
            })
            // req.flash("error", "User already exist")
            // res.redirect("back")
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);
        
        if(role === 'admin'){
            var verify = true;
            var emailVerified = true
        }else{
          verify = false;
          emailVerified = true
        }
        

        user = new User({
            email,
            password: hashedPass,
            email_verify: emailVerified
        });
    
        const Newuser = await user.save();
        res.status(200).json({
            status: true,
            data: Newuser
        })
        // req.flash('success', "Registration successful")
        //  res.redirect(`login-${role}`);

    }catch(error){
        console.error(error)
        res.status(500).json({
            status: false,
            message: error
        })
        next(error)
        // req.flash("error", "An error occured refresh the page")
        // res.redirect("back")
    }
};


exports.webLoginUser = async (role, req, res, next) => {
    try{

        const {email, password } = req.body;
        const user = await User.findOne({where: {
            email: email }
        });
        if(!user){
            res.status(404).jdon({
                status: false,
                message: 'User does not exist'
            })
            // req.flash("warning", 'User does not exist');
            // res.redirect("back")
        }

        if(user.role !== role){
            res.status(401).jdon({
                status: false,
                message: 'Please ensure you are logging-in from the right portal'
            })
        //   req.flash("warning", "Please ensure you are logging-in from the right portal");
        //   res.redirect("back")
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
                token: `Bearer ${token}`,
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                expiresIn: '24 hours',
                email_verify: user.email_verify,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt,
            };

            // var option = {
            //     httpOnly: true,
            //     signed: true,
            //     sameSite: true,
            //     secure: (process.env.NODE_ENV !== 'development'),
            //     secret: process.env.CSECRET
            // }

            res.json({
                status: true,
                data: result
            })
            
            

            //res.status(200)
            // req.flash("success", "Successfully logged in");
            // res.cookie("jwt", token, option);
            // res.redirect(`/dashboard/${role}`)

            

             

        } else{
           //res.status(403)
        //   req.flash("warning", 'Wrong password');
        //   res.redirect("back")
        res.status(404).json({
            status: false,
            message: "User not found"
        })
        }


    } catch(error){
        console.error(error);
        res.status(500).json({
            status: false,
            message: error
        });
        next(error);
    //   req.flash("error", "An error occured refresh the page")
    //   res.redirect("back")
    }
};


exports.userAuth = passport.authenticate('jwt', {session: true});



exports.profile = user => {
     return {
        id: user.id,
        fullname: user.fullname,
        phone_no: user.phone_no,
        country: user.country,
        email: user.email,
        address: user.address,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
    };

};


exports.getUsers = async (req, res, next)=>{
    try {
        const users = await User.findAll({where: {role: 'user'}})
        if (users){
            return res.status(200).json({
                status: true,
                data: users})
        } else{
            res.status(404).json({
                status: false,
                message: "No user found"})
        }
       
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
        // req.flash("error", "An error occured refresh the page")
    }
};

exports.getUser = async (req, res, next) => {
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
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
    //    req.flash("error", "An error occured refresh the page")
    //    res.redirect("back")
    }
};

exports.updateUser = async(req, res, next) => {
    try{
        await User.update( req.body, { where: 
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
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
    }
}

exports.deleteUser = async(req, res, next) => {
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
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
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

