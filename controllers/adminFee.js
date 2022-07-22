const Fee = require("../model/adminFee");


exports.createFee = async(req, res, next)=>{
    const {type, description, value}= req.body;
    try {
        await Fee.findOne({
            where:{
                type: type
            }
        }).then(async(fee)=>{
            if(fee){
                res.json({
                    status: false,
                    message: `Fee for type: ${type} already exist`
                })
            }else{
                const new_fee = new Fee({
                    type,
                    description,
                    value
                })

                const out = await new_fee.save();

                res.json({
                    status: true,
                    message: `Fee of type: ${type} created successfully`,
                    data: out
                })
            }
        })
    } catch (error) {
        console.log(error),
        next(error)
    }
}

exports.updateFee = async(req, res, next)=>{
    const {type, description, value}= req.body;
    try {
        await Fee.findOne({
            where:{
                id: req.params.feeId
            }
        })
        .then(async(fee)=>{
            if(fee){
                await Fee.update({
                    type: type,
                    description: description,
                    value: value
                }, {
                    where:{
                        id: fee.id
                    }
                })
                res.json({
                    status: true,
                    message: "Fee updated"
                })
            }else{
                res.json({
                    status: false,
                    message: "Fee not found"
                })
            }
        })
    } catch (error) {
        console.log(error),
        next(error)
    }
}

exports.getFees = async(req, res, next)=>{
    try {
        await Fee.findAll()
        .then(async(fee)=>{
            if(fee){
                res.json({
                    status: true,
                    data: fee
                })
            }else{
                res.json({
                    status: false,
                    message: "Fee not found"
                })
            }
        })
    } catch (error) {
        console.log(error),
        next(error)
    }
}

exports.getFeeById = async(req, res, next)=>{
    try {
        await Fee.findOne({
            where:{
                id: req.params.feeId
            }
        })
        .then(async(fee)=>{
            if(fee){
                res.json({
                    status: true,
                    data: fee
                })
            }else{
                res.json({
                    status: false,
                    message: "Fee not found"
                })
            }
        })
    } catch (error) {
        console.log(error),
        next(error)
    }
}

exports.deleteFee = async(req, res, next)=>{
    try {
        await Fee.findOne({
            where:{
                id: req.params.feeId
            }
        })
        .then(async(fee)=>{
            if(fee){
                await Fee.destroy({
                    where:{
                        id: fee.id
                    }
                })
                res.json({
                    status: true,
                    message: "Fee deleted"
                })
            }else{
                res.json({
                    status: false,
                    message: "Fee not found"
                })
            }
        })
    } catch (error) {
        console.log(error),
        next(error)
    }
}