const Subscription = require("../model/subscription");
const User = require("../model/user");



exports.addSubscription = async(req, res) => {
    const sub_type = req.body;
    try {
        var date;
        var amount = "",

        if(sub_type === 'free'){
            date = 7; 
        }else if( sub_type === "basic"){
            date = 30;
            amount = "3000";
        }else if(sub_type === "standard"){
            date = 180;
            amount = "12000";
        }else if(sub_type === "premium"){
            date = 365;
            amount = "22000";
        }

        await Subscription.findOne({where: {
            userid: req.user.id
        }}).then((subscription) => {

            if(subscription){
                if(subscription.expire_date !== null){
                    var someDate = new Date(`${subscription.expire_date}`);
                } else{
                    someDate = new Date()
                }
                someDate.setDate(someDate.getDate() + date); //number  of days to add, e.x. 15 days
                var dateFormated = someDate.toISOString().substr(0,10);
                
                await Subscription.update({
                    sub_type: sub_type,
                    expire_date: dateFormated

                }, {where: {
                    userid: req.user.id
                }})

                res.status(200).json({
                    status: true,
                    message: `Successfully subscribed to ${sub_type.toUpperCase()} Plan`
                })

            }else{
                someDate = new Date();
                someDate.setDate(someDate.getDate() + date); //number  of days to add, e.x. 15 days
                dateFormated = someDate.toISOString().substr(0,10);
                Subscription.create({
                    userid: req.user.id,
                    sub_type: sub_type,
                    expire_date: dateFormated
                })
                res.status(201).json({
                    status: true,
                    message: `Successfully subscribed to ${sub_type.toUpperCase()} Plan`
                })
            }
               
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
             status: false,
             message: "Error occured",
             error: error
         })
    }
}