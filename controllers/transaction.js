const store = require("store");
const Transaction = require("../model/Transaction");
const User = require("../model/user");


exports.getAllTransactions = async (req, res, next) => {
  try {



           let page; // page number
           let limit = 20;
           // let offset;
           let transaction;
           let totalPages;
           let data;
       if (!req.query.page) {
         // if page not sent
         page = 0;

         data = await Transaction.count({
           order: [["createdAt", "DESC"]],
         });

         if (data > 0) {
           totalPages = Math.ceil(data / limit);
       transaction = await Transaction.findAll({
         order: [["createdAt", "DESC"]],
         include: [
           {
             model: User,
             as: "user"
           },
         ],
       });
        return res.status(200).send({
          success: true,
          data: transaction,
          totalpage: totalPages,
          count: transaction.length,
          totalcount: data,
        });
         } else {
           return res.status(200).send({
             success: true,
             data: [],
           });
         }
       } else {
         //if page is sent
         page = +req.query.page;
         const getPagination = (page) => {
           limit = 20;
           h = page - 1;
           let offset = h * limit;

           return { limit, offset };
         };

         data = await Transaction.count({
           order: [["createdAt", "DESC"]],
         });

         const { offset } = getPagination(page);
         if (data > 0) {
           let totalPages = Math.ceil(data / limit);

           transaction = await Transaction.findAll({
             order: [["createdAt", "DESC"]],
             include: [
               {
                 model: User,
                 as: "user",
               },
             ],
             limit,
             offset,
           });
           return res.status(200).send({
             success: true,
             data: transaction,
             totalpage: totalPages,
             count: transaction.length,
             totalcount: data,
           });
         } else {
           return res.status(200).send({
             success: true,
             data: [ ],
           });
         }
       }
  } catch (error) {
    console.log(error);
    res.json(error);
    next(error);
  }
};

exports.getAllApprovedTransactions = async (req, res, next) => {
  try {
    let page; // page number
    let limit = 20;
    // let offset;
    let transaction;
    let totalPages;
    let data;
    if (!req.query.page) {
      // if page not sent
      page = 0;

      data = await Transaction.count({
        where: { status: "approved" },
        order: [["createdAt", "DESC"]],
      });

      if (data > 0) {
        totalPages = Math.ceil(data / limit);
        transaction = await Transaction.findAll({
          where: { status: "approved" },
          order: [["createdAt", "DESC"]],
      
        });
        return res.status(200).send({
          success: true,
          data: transaction,
          totalpage: totalPages,
          count: transaction.length,
          totalcount: data,
        });
      } else {
        return res.status(200).send({
          success: true,
          data: [ ],
        });
      }
    } else {
      //if page is sent
      page = +req.query.page;
      const getPagination = (page) => {
        limit = 20;
        h = page - 1;
        let offset = h * limit;

        return { limit, offset };
      };

      data = await Transaction.count({
        where: { status: "approved" },
        order: [["createdAt", "DESC"]],
      });

      const { offset } = getPagination(page);
      if (data > 0) {
        let totalPages = Math.ceil(data / limit);

        transaction = await Transaction.findAll({
          where: { status: "approved" },
          order: [["createdAt", "DESC"]],
          limit,
          offset,
        });
        return res.status(200).send({
          success: true,
          data: transaction,
          totalpage: totalPages,
          count: transaction.length,
          totalcount: data,
        });
      } else {
        return res.status(200).send({
          success: true,
          data: [ ],
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.json(error);
    next(error);
  }
};

exports.getAllPendingTransactions = async (req, res, next) => {
  try {
    let page; // page number
    let limit = 20;
    // let offset;
    let transaction;
    let totalPages;
    let data;
    if (!req.query.page) {
      // if page not sent
      page = 0;

      data = await Transaction.count({
        where: { status: "pending" },
        order: [["createdAt", "DESC"]],
      });

      if (data > 0) {
        totalPages = Math.ceil(data / limit);
        transaction = await Transaction.findAll({
          where: { status: "pending" },
          order: [["createdAt", "DESC"]],
      
        });
        return res.status(200).send({
          success: true,
          data: transaction,
          totalpage: totalPages,
          count: transaction.length,
          totalcount: data,
        });
      } else {
        return res.status(200).send({
          success: true,
          data: [ ],
        });
      }
    } else {
      //if page is sent
      page = +req.query.page;
      const getPagination = (page) => {
        limit = 20;
        h = page - 1;
        let offset = h * limit;

        return { limit, offset };
      };

      data = await Transaction.count({
        where: { status: "pending" },
        order: [["createdAt", "DESC"]],
      });

      const { offset } = getPagination(page);
      if (data > 0) {
        let totalPages = Math.ceil(data / limit);

        transaction = await Transaction.findAll({
          where: { status: "pending" },
          order: [["createdAt", "DESC"]],
          limit,
          offset,
        });
        return res.status(200).send({
          success: true,
          data: transaction,
          totalpage: totalPages,
          count: transaction.length,
          totalcount: data,
        });
      } else {
        return res.status(200).send({
          success: true,
          data: [ ],
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.json(error);
    next(error);
  }
};

exports.getUserTransactions = async (req, res, next) => {
  try {
   
    let userId = req.query.userId; // page number

    
           let page; // page number
           let limit = 20;
           // let offset;
           let transaction;
           let totalPages;
           let data;
           if (!req.query.page) {
             // if page not sent
             page = 0;

             data = await Transaction.count({
              where: {userId},
               order: [["createdAt", "DESC"]],
             });

             if (data > 0) {
               totalPages = Math.ceil(data / limit);
               transaction = await Transaction.findAll({
                 where: { userId },
                 order: [["createdAt", "DESC"]],
               
               });
               return res.status(200).send({
                 success: true,
                 data: transaction,
                 totalpage: totalPages,
                 count: transaction.length,
                 totalcount: data,
               });
             } else {
               return res.status(200).send({
                 success: true,
                 data: [ ],
               });
             }
           } else {
             //if page is sent
             page = +req.query.page;
             const getPagination = (page) => {
               limit = 20;
               h = page - 1;
               let offset = h * limit;

               return { limit, offset };
             };

             data = await Transaction.count({
               where: { userId },
               order: [["createdAt", "DESC"]],
             });

             const { offset } = getPagination(page);
             if (data > 0) {
               let totalPages = Math.ceil(data / limit);

               transaction = await Transaction.findAll({
                 where: { userId },
                 order: [["createdAt", "DESC"]],
                 limit,
                 offset,
               });
               return res.status(200).send({
                 success: true,
                 data: transaction,
                 totalpage: totalPages,
                 count: transaction.length,
                 totalcount: data,
               });
             } else {
               return res.status(200).send({
                 success: true,
                 data: [ ],
               });
             }
           }
  } catch (error) {
    console.log(error);
    res.json(error);
    next(error);
  }
};

exports.getSingleTransaction = async (req, res, next) => {
  try {
    const id = req.query.transactionId;
    const transaction = await Transaction.findOne({
      where: { id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.log(error);
    res.json(error);
    next(error);
  }
};

// exports.getAllTransactions = async (req, res, next) => {
//   try {
//     const transactions = await Transaction.findAll({
//       order: [["createdAt", "DESC"]],
//     });

//     return res.status(200).send({
//       success: true,
//       data: transactions,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json(error);
//     next(error);
//   }
// };
