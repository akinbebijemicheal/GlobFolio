const Transaction = require("../model/usertransactions");
const store = require("store");

exports.getAllTransactions = async (req, res, next) => {
  try {
    let page = +req.query.page; // page number

    const getPagination = (page) => {
      const limit = 25;
      let h = page - 1;
      let offset = h * limit;

      return { limit, offset };
    };

    const data = await Transaction.count({
      where: { status: "approved" },
      order: [["createdAt", "DESC"]],
    });

    const { limit, offset } = getPagination(page);
    if (data > 0) {
      const totalPages = Math.ceil(data / limit);

      const Transaction = await Transaction.findAll({
        where: { status: "approved" },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      return res.status(200).send({
        success: true,
        data: Transaction,
        totalpage: totalPages,
        count: Transaction.length,
        totalcount: data,
      });
    } else {
      return res.status(200).send({
        success: true,
        data: null,
      });
    }
  } catch (error) {
    console.log(error);
    res.json(error);
    next(error);
  }
};

exports.getUserTransactions = async (req, res, next) => {
  try {
    let page = +req.query.page; // page number
    let userId = req.body.userId; // page number

    const getPagination = (page) => {
      const limit = 10;
      let h = page - 1;
      let offset = h * limit;

      return { limit, offset };
    };

    const data = await Transaction.count({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    const { limit, offset } = getPagination(page);
    if (data > 0) {
      const totalPages = Math.ceil(data / limit);

      const Transaction = await Transaction.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });
      return res.status(200).send({
        success: true,
        data: Transaction,
        totalpage: totalPages,
        count: Transaction.length,
        totalcount: data,
      });
    } else {
      return res.status(200).send({
        success: true,
        data: null,
      });
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
