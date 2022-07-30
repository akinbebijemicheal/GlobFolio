const Transaction = require("../model/usertransactions");

exports.getAllTransactions = async(req, res, next)=>{
    try {
        await Transaction.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
        }).then(trans =>{
            if(trans){
                res.json({
                    status: true,
                    data: trans
                })
            }else{
                res.json({
                    status: false,
                    message: "Transaction not found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}