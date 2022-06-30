const User = require('../model/user');
const Restaurant = require('../model/restuarant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config();
const nodemailer = require('nodemailer')
const baseurl = process.env.BASE_URL

exports.RegisterUser = async (role, req, res) => {
    try{

        const {email, password } = req.body;

        let user = await User.findOne({
            where: {
                email: email 
                }
            });
        if(user) {
            res.status(302)
            req.flash("error", "User already exist")
            res.redirect("back")
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

        req.flash('success', "Registration successful")
         res.redirect(`login-${role}`);

    }catch(error){
        console.error(error)
        //res.status(500)
        req.flash("error", "An error occured refresh the page")
        res.redirect("back")
    }
};


exports.webLoginUser = async (role, req, res) => {
    try{

        const {email, password } = req.body;
        const user = await User.findOne({where: {
            email: email }
        });
        if(!user){
            res.status(404)
            req.flash("warning", 'User does not exist');
            res.redirect("back")
        }

        if(user.role !== role){
          req.flash("warning", "Please ensure you are logging-in from the right portal");
          res.redirect("back")
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
                address: user.address,
                expiresIn: '24 hours',
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
            
            

            //res.status(200)
            req.flash("success", "Successfully logged in");
            res.cookie("jwt", token, option);
            res.redirect(`/dashboard/${role}`)

            

             

        } else{
           //res.status(403)
          req.flash("warning", 'Wrong password');
          res.redirect("back")
        }


    } catch(error){
        console.error(error)
      // res.status(500)
      req.flash("error", "An error occured refresh the page")
      res.redirect("back")
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


exports.getUsers = async (req, res)=>{
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
        res.status(500)
        req.flash("error", "An error occured refresh the page")
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
        res.status(500)
       req.flash("error", "An error occured refresh the page")
       res.redirect("back")
    }
};

exports.updateUser = async(req, res) => {
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
        res.status(500)
        req.flash("error", "An error occured refresh the page")
        res.redirect("back")
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
        res.status(500)
       req.flash("error", "An error occured refresh the page")
       res.redirect("back")
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

