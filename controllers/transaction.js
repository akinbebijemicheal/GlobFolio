const Transaction = require("../model/usertransactions");
const store = require('store');


exports.getAllTransactions = async(req, res, next)=>{
    try {
        await Transaction.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
        }).then(trans =>{
            if(trans){
                console.log("Transactions found")
                store.set("trans", JSON.stringify(trans));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("trans"));
                      console.log(data)
                      res.render("dashboard/admin/getAlltransactions", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data: data
                      });
                      next();
            }else{
                console.log("No transactions found")
                store.set("trans", JSON.stringify(trans));
                      let name = req.user.fullname.split(" ");
                      let email = req.user.email;
                      data = JSON.parse(store.get("trans"));
                      console.log(data)
                      res.render("dashboard/admin/getAllTransactions", {
                        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                        email: email,
                        data: data
                      });
                      next();
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}