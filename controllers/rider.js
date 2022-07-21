const Rider = require("../model/riders");

exports.createRider = async(req, res, next)=>{
    const {fullname, email, phone_no, address, country} = req.body;
    try {
        await Rider.findOne({
            where:{
                email: email
            }
        }).then(async(rider)=>{
            if(!rider){
                const new_rider = new Rider({
                    fullname,
                    email,
                    phone_no,
                    address,
                    country
                })

                const out = await new_rider.save();

                res.json({
                    status: true,
                    message: "New Rider added",
                    data: out
                })
            }else{
                res.json({
                    status: false,
                    message: "Rider email already exist"
                })
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.updateRider = async(req, res, next)=>{
    const {fullname, email, phone_no, address, country} = req.body;
    try {
        await Rider.findOne({
            where:{
                id: req.params.riderId
            }
        }).then(async(rider)=>{
            if(rider){
               await Rider.update({
                   fullname: fullname,
                   email: email,
                   phone_no: phone_no,
                   address: address,
                   country: country
               }, {
                   where:{
                       id: rider.id
                   }
               })

                res.json({
                    status: true,
                    message: "Rider info updated",
                })
            }else{
                res.json({
                    status: false,
                    message: "Rider doesn't exist"
                })
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.getRiders = async(req, res, next)=>{
    try {
        await Rider.findAll()
        .then(async(rider)=>{
            if(rider){
                res.json({
                    status: true,
                    data: rider
                })
            }else{
                res.json({
                    status: false,
                    message: "Rider not found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.getRiderById = async(req, res, next)=>{
    try {
        await Rider.findOne({
            where:{
                id: req.params.riderId
            }
        })
        .then(async(rider)=>{
            if(rider){
                res.json({
                    status: true,
                    data: rider
                })
            }else{
                res.json({
                    status: false,
                    message: "Rider not found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.deleteRider = async(req, res, next)=>{
    try {
        await Rider.findOne({
            where:{
                id: req.params.riderId
            }
        })
        .then(async(rider)=>{
            if(rider){
                await Rider.destroy({
                    where:{
                        id: rider.id
                    }
                })
                res.json({
                    status: true,
                    message: "Rider Removed"
                })
            }else{
                res.json({
                    status: false,
                    message: "Rider not found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}