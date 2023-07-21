const Transaction = require("../model/usertransactions");
const store = require('store');


exports.getAllTransactions = async(req, res, next)=>{
    try {
     const transactions = await Transaction.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
        })

        return res.status(200).send({
      success: true,
      data: transactions,
    });
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}