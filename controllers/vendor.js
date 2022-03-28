const User = require('../model/user');
require('dotenv').config();



exports.getUnverifieds = async( req, res) => {
    try {
        const users = await User.findAll({ where: {
            role: 'vendor',
            verified: false
         
    }})

    return res.status(200).json({
        status: false,
        data: users});

    } catch (error) {
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "error occured",
             error: error
         })
    }
}
exports.verification = async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({ where: {
            email: email
        }})
        if(user && user.role === 'vendor'){
            await User.update({verified: true}, {
                where: {
                    email: email
                }
            });
            res.status(200).json({
                status: true,
                message: "Vendor verified!"
            })
        } else {
            res.status(301).json({
                status: false,
                message: "Vendor already verified!"})
        }
    } catch (error) {
        console.error(error)
       return res.status(500).json({
            status: false,
            message: "error occured",
            error: error
        })
};
}

exports.getVendors = async(req, res) => {
    try {
        const users = await User.findAll( {where: {role: 'vendor'}})
        if (users){
            return res.status(200).json({
                status: true,
                data: users
            })
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
}

exports.getVendorsByServices = async(req, res) => {
    const { serviceType} = req.body
    try {
        const users = await User.findAll(
            { where: {
                role: 'vendor',
                serviceType: serviceType
            }})
        if (users){
            return res.status(200).json({
                status: true,
                data: users
            })
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
}


