const Restaurant = require('../model/restuarant');
const Food = require('../model/food')

exports.UpdateResturant = async( req, res, next)=>{
    
    try {
        await Restaurant.update(
            req.body, {
                where:{
                    userId: req.user.id
                }
            }
        ).then((rest) => {
            res.status.json({
                status: true,
                message: "Restuarant detail updated"
            })
        })
        .catch(err=>console.log(err))
        
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.getRestuarants = async(req, res, next)=>{
    try {
        await Restaurant.findAll({
            include:[
                {
                    model: Food,
                    attributes: {
                        exclude:["createdAt", "updatedAt"]
                    }
                }
            ]
        })
        .then((restuarant) => {
            if(restuarant){
                res.status.json({
                    status: true,
                    data: restuarant
                })
            }else{
                res.status.json({
                    status: false,
                    message: "No Restuarant Found"
                })
            }
            
        }).catch(err => console.log(err))
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.getRestuarant = async(req, res, next) =>{
    try {
        await Restaurant.findOne({
            where: {
                id: req.params.id
            }
        }).then((restuarant) => {
            if(restuarant){
                res.status.json({
                    status: true,
                    data: restuarant
                })
            }else{
                res.status.json({
                    status: false,
                    message: "No Restuarant Found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.getRestuarantUser = async(req, res, next) =>{
    try {
        await Restaurant.findOne({
            where: {
                userId: req.user.id
            }
        }).then((restuarant) => {
            if(restuarant){
                res.status.json({
                    status: true,
                    data: restuarant
                })
            }else{
                res.status.json({
                    status: false,
                    message: "No Restuarant Found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

exports.deleteRestuarant = async(req, res, next)=>{
    try {
        await Restaurant.destroy({
            where: {
                id: req.params.id
            }
        })
        res.status.json({
            status: true,
            message: "Restuarant deleted successfully"
        })
            
        
    } catch (error) {
        console.log(error);
        next(error)
    }
}

