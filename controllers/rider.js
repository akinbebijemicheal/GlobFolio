const Rider = require("../model/riders");
const store = require('store')

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

                res.redirect("/dashboard/admin/")
                
            }else{
            req.flash("error", "User already exist")
            res.redirect("back")
                
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
                console.log("riders found")
                store.set("rider", JSON.stringify(rider));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("rider"));
                      console.log(data)
                      res.render("dashboard/admin/riders", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data
                      });
                      next();
            }else{
                console.log("No Rider found")
                store.set("rider", JSON.stringify(rider));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("rider"));
                      console.log(data)
                      res.render("dashboard/admin/riders", {
                        rider: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data
                      });
                      next();
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
                id: req.params.id
            }
        })
        .then(async(rider)=>{
            if(rider){
                await Rider.destroy({
                    where:{
                        id: rider.id
                    }
                })
                console.log('Rider delete successful')

            }else{
                console.log('Rider not found')
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}