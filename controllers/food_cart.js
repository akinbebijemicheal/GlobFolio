// const Cart = require("../model/cart");
const CartItem = require("../model/cartItem");
const User = require("../model/user");
const Food = require("../model/food");
const FoodExtra = require("../model/foodextras");
const Package = require("../model/foodpackaging");
const Image = require("../model/foodimage");
const Order = require("../model/foodorder");
const CartItemExtra = require("../model/cartitemextra");
const Transaction = require("../model/usertransactions");
require("dotenv").config();
const paystack = require("paystack")(process.env.PAYSTACK_SECRET);
const Fee = require("../model/adminFee");
const store = require("store");
const nodemailer = require("nodemailer");
const baseurl = process.env.BASE_URL;

var transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  tls: {
    rejectUnauthorized: false,
  },
  ool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5,
  auth: {
    user: process.env.EMAIL_USERNAME, // generated ethereal user
    pass: process.env.EMAIL_PASSWORD, // generated ethereal password
  },
});

exports.buyFood = async (req, res, next) => {
  var { quantity, foodextrasId, foodpackageId, address, phone_no, note } =
    req.body;
  try {
    if (!quantity) {
      quantity = 1;
    }

    var commision = await Fee.findOne({
      where: {
        type: "commission",
      },
    });

    await Food.findOne({
      where: {
        id: req.params.foodId,
      },
    }).then(async (food) => {
      if (food) {
        const order = await Order.findOne({
          where: {
            userId: req.user.id,
            new: true,
            paid: false,
          },
        });
        if (order) {
          var orderId = order.id;
        } else {
          var new_order = new Order({
            userId: req.user.id,
          });
          var outer = await new_order.save();
          orderId = outer.id;
        }
        if (
          foodextrasId &&
          foodextrasId !== null &&
          foodextrasId !== undefined
        ) {
          var extra = await FoodExtra.findOne({
            where: {
              id: foodextrasId,
            },
          });
        }

        if (
          foodpackageId &&
          foodpackageId !== null &&
          foodpackageId !== undefined
        ) {
          var package = await Package.findOne({
            where: {
              id: foodpackageId,
            },
          });
        } else {
          res.json({
            status: false,
            message: "Please select a Package",
          });
        }

        if (extra) {
          var price = parseInt(food.price) + parseInt(extra.price);
          var extraId = extra.id;
        } else {
          price = parseInt(food.price);
          extraId = null;
        }

        if (package) {
          price = price + package.price;
          var packageId = package.id;
        } else {
          res.json({
            status: false,
            message: "Please select a Package",
          });
        }

        const Items = new CartItem({
          userId: req.user.id,
          foodId: food.id,
          foodextrasId: extraId,
          foodpackageId: packageId,
          orderId: orderId,
          qty: quantity,
          price: price * quantity,
          ordered: true,
        });

        var Cart = await Items.save();

        await Order.findOne({
          where: {
            id: Cart.orderId,
          },
          include: [
            {
              model: CartItem,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
              include: [
                {
                  model: Food,
                  attributes: {
                    exclude: ["createdAt", "updatedAt"],
                  },
                },
                {
                  model: FoodExtra,
                  attributes: {
                    exclude: ["createdAt", "updatedAt"],
                  },
                },
                {
                  model: Package,
                  attributes: {
                    exclude: ["createdAt", "updatedAt"],
                  },
                },
              ],
            },
            {
              model: User,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        }).then(async (ord) => {
          if (ord) {
            var total = Cart.price;

            var charge = (commision.value / 100) * total;

            paystack.transaction
              .initialize({
                name: `Food Order #${ord.id}`,
                email: ord.user.email,
                amount: parseInt(total + charge) * 100,
                quantity: ord.fooditems.length,
                callback_url: `${process.env.REDIRECT_SITE}/VerifyPay/food`,
                metadata: {
                  userId: req.user.id,
                  orderId: ord.id,
                },
              })
              .then(async (transaction) => {
                console.log(transaction);
                if (transaction) {
                  await Order.update(
                    {
                      address: address,
                      phone_no: phone_no,
                      note: note,
                      sub_total: total,
                      status: "in_progress",
                      checkout_url: transaction.data.authorization_url,
                      ref_no: transaction.data.reference,
                      access_code: transaction.data.access_code,
                      commission: parseInt(charge),
                    },
                    {
                      where: {
                        id: ord.id,
                      },
                    }
                  ).catch((err) => console.log(err));
                }
              })
              .catch((err) => console.log(err));

            const out = await Order.findOne({
              where: {
                id: order.id,
              },
              include: [
                {
                  model: CartItem,
                  attributes: {
                    exclude: ["createdAt", "updatedAt"],
                  },
                  include: [
                    {
                      model: Food,
                      attributes: {
                        exclude: ["createdAt", "updatedAt"],
                      },
                    },
                    {
                      model: FoodExtra,
                      attributes: {
                        exclude: ["createdAt", "updatedAt"],
                      },
                    },
                    {
                      model: Package,
                      attributes: {
                        exclude: ["createdAt", "updatedAt"],
                      },
                    },
                  ],
                },
                {
                  model: User,
                  attributes: {
                    exclude: ["createdAt", "updatedAt"],
                  },
                },
              ],
            });
            res.status(201).json({
              status: true,
              message: "Order created",
              data: out,
            });
          } else {
            res.json({
              status: false,
              message: "No item found",
            });
          }
        });
      } else {
        res.status(404).json({
          status: false,
          message: "No Food found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  })
    next(error);
  }
};

exports.AddCart = async (req, res, next) => {
  var { quantity, foodextrasId, foodpackageId } = req.body;
  var foodId = req.params.foodId;
  var userId = req.user.id;
  console.log(req.body);
  try {
    const existeditem = await CartItem.findAll({
      where: {
        foodId: foodId,
        userId: userId,
      },
    });
    console.log(existeditem);

    if (existeditem.length > 0) {
      for (let i = 0; i < existeditem.length; i++) {
        let array1 = foodextrasId;
        let array2 = existeditem[i].foodextrasId;
       
          if (array1.length === array2.length) {
                          for (let c = 0; c < array1.length; c++) {

              if (array2.includes(array1[c])) {
                var cartqty = existeditem[i].qty;
                var newqty = cartqty + quantity;
                var cartprice = existeditem[i].price;
                var oldprice = cartprice / cartqty;

                CartItem.update(
                  {
                    qty: newqty,
                    price: oldprice * newqty,
                  },
                  {
                    where: {
                      id: existeditem[i].id,
                      foodId: foodId,
                      userId: userId,
                    },
                  }
                );

                for (let count = 0; count < foodextrasId.length; count++) {
                  console.log(existeditem[i].id);
                  console.log(foodextrasId[count])
                  let extra = await CartItemExtra.findOne({
                    where: {
                      foodextrasId: foodextrasId[count],
                      cartItemId: existeditem[i].id,
                    },
                  });
                  console.log(extra)


                  var cq = extra.qty;
                  var nq = cq + quantity;
                  var cprice = extra.price;
                  var oprice = cprice / cq;

                  CartItemExtra.update(
                    {
                      qty: nq,
                      price: oprice * nq,
                    },
                    {
                      where: {
                        cartItemId: existeditem[i].id,
                        foodextrasId: foodextrasId[count],
                      },
                    }
                  );
                }
                return res.status(201).json({
                  status: true,
                  message: "true",
                });
              }
            
            };
          }
        
        

      }
    } else {
      if (!quantity) {
        quantity = 1;
      }

      await Food.findOne({
        where: {
          id: foodId,
        },
      }).then(async (food) => {
        if (food) {
          const order = await Order.findOne({
            where: {
              userId: userId,
              new: true,
              paid: false,
            },
          });
          if (order) {
            var orderId = order.id;
          } else {
            var new_order = new Order({
              userId: req.user.id,
            });
            var outer2 = await new_order.save();
            var orderId = outer2.id;
          }

          var extras = [];

          // if (foodextrasId != null) {
          //     let extra = await FoodExtra.findOne({
          //         where: {
          //             id: foodextrasId
          //         }

          //     })
          //     console.log(extra)
          // }

          // if (foodextrasId.length > 0) {
          //   foodextrasId.forEach(async (extraId) => {
          //     let _extra = await FoodExtra.findOne({
          //       where: {
          //         id: extraId,
          //       },
          //     });
          //     console.log(_extra)
          //     if (_extra !== null) {
          //     await  extras.push(_extra);
          //     }
          //   });
          // }

          for (let i = 0; i < foodextrasId.length; i++) {
            let extra = await FoodExtra.findOne({
              where: {
                id: foodextrasId[i],
              },
            });
            if (extra !== null) {
              extras.push(extra);
            }

            console.log(extras);
          }
          //  return res.status(201).json({
          //     status: true,
          //     data: extras
          //   });

          if (foodpackageId != null) {
            var package = await Package.findOne({
              where: {
                id: foodpackageId,
              },
            });
          } else {
            res.json({
              status: false,
              message: "Please select a Package",
            });
          }

          let extra_price_total = 0;

          for (let i = 0; i < extras.length; i++) {
            extra_price_total += parseInt(extras[i].price);
          }
          console.log(extra_price_total);

          if (package) {
            var packageprice = parseInt(package.price);

            var packageId = package.id;
          } else {
            res.json({
              status: false,
              message: "Please select a Package",
            });
          }

          let price = parseInt(food.price) + extra_price_total + packageprice;

          const Items = new CartItem({
            userId: userId,
            foodId: food.id,
            foodextrasId: foodextrasId,
            extras,
            foodpackageId: packageId,
            orderId: orderId,
            qty: quantity,
            price: price * quantity,
          });

          const Cart = await Items.save();

          for (let i = 0; i < extras.length; i++) {
            const ItemsExtra = new CartItemExtra({
              userId: userId,
              foodId: food.id,
              foodextrasId: extras[i].id,
              cartItemId: Cart.id,
              qty: quantity,
              price: extras[i].price * quantity,
            });

            const CartExtra = await ItemsExtra.save();
          }

          const out = await CartItem.findOne({
            where: {
              id: Cart.id,
            },
            include: [
              {
                model: User,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
              {
                model: Food,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
                include: [
                  {
                    model: Image,
                    attributes: {
                      exclude: ["createdAt", "updatedAt"],
                    },
                  },
                ],
              },
              {
                model: CartItemExtra,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
                include: [
                  {
                    model: FoodExtra,
                    attributes: {
                      exclude: ["createdAt", "updatedAt"],
                    },
                  },
                ],
              },
              {
                model: Package,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
            ],
          });

          res.status(201).json({
            status: true,
            data: out,
          });
        } else {
          return res.status(404).json({
            status: false,
            message: "No Food found",
          });
        }
      });
    }
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  })
    next(error);
  }
};

exports.viewCart = async (req, res, next) => {
  try {
    const viewcart = await CartItem.findAll({
      where: {
        userId: req.user.id,
        ordered: false,
      },
      include: [
        {
          model: Food,
          include: [
            {
              model: Image,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: CartItemExtra,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: FoodExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
        {
          model: Package,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    });
    res.status(200).json({
      status: true,
      data: viewcart,
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  });
    next(error);
  }
};

exports.DeleteCartItem = async (req, res, next) => {
  try {
    await CartItem.findOne({
      where: {
        id: req.params.cartitemId,
      },
    }).then(async (item) => {
      if (item) {
        await CartItem.destroy({
          where: {
            id: item.id,
          },
        });
        res.status(200).json({
          status: true,
          message: "Item Removed Successfully",
        });
      } else {
        res.status(404).json({
          status: false,
          message: "Item not found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  });
    next(error);
  }
};

exports.addQty = async (req, res, next) => {
  var { quantity } = req.body;
  // qty = parseInt(qty)
  try {
    await CartItem.findOne({
      where: {
        id: req.params.cartitemId,
      },
      include: [
        {
          model: Food,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: CartItemExtra,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: FoodExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
      ],
    }).then(async (item) => {
      if (item) {
        var oldqty = item.qty;
        var newqty = oldqty + 1;
        var price = item.price;
        var originalprice = price / oldqty;

        await CartItem.update(
          {
            qty: newqty,
            price: originalprice * newqty,
          },
          {
            where: {
              id: item.id,
            },
          }
        );


        console.log(item.fooditemextras)
const itemextra = item.fooditemextras;
        
                for (let count = 0; count < itemextra.length; count++) {
                  console.log(itemextra[count]);
           
             

                  var cq = itemextra[count].qty;
                  var nq = cq + 1;
                  var cprice = itemextra[count].price;
                  var oprice = cprice / cq;

                  CartItemExtra.update(
                    {
                      qty: nq,
                      price: oprice * nq,
                    },
                    {
                      where: {
                        cartItemId: item.id,
                        foodextrasId: itemextra[count].foodextrasId,
                      },
                    }
                  );
                }

        const result = await CartItem.findOne({
          where: {
            id: item.id,
          },
          include: [{
          model: CartItemExtra,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: FoodExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },]
          
          
        });
        res.status(200).json({
          status: true,
          message: "Item quantity Increased",
          data: result,
        });
      } else {
        res.status(404).json({
          status: false,
          message: "Product not found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  });
    next(error);
  }
};

exports.subtractQty = async (req, res, next) => {
  var { quantity } = req.body;
  // qty = parseInt(qty)
  try {
    await CartItem.findOne({
      where: {
        id: req.params.cartitemId,
      },
      include: [
        {
          model: Food,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    }).then(async (item) => {
      if (item) {
        var oldqty = item.qty;
        var newqty = oldqty - 1;
        var price = item.price;
        var originalprice = price / oldqty;

        await CartItem.update(
          {
            qty: newqty,
            price: originalprice * newqty,
          },
          {
            where: {
              id: item.id,
            },
          }
        );



        console.log(item.fooditemextras);
        const itemextra = item.fooditemextras;

        for (let count = 0; count < itemextra.length; count++) {
          console.log(itemextra[count]);

          var cq = itemextra[count].qty;
          var nq = cq - 1;
          var cprice = itemextra[count].price;
          var oprice = cprice / cq;

          CartItemExtra.update(
            {
              qty: nq,
              price: oprice * nq,
            },
            {
              where: {
                cartItemId: item.id,
                foodextrasId: itemextra[count].foodextrasId,
              },
            }
          );
        }

        const result = await CartItem.findOne({
          where: {
            id: item.id,
          },
          include: [
            {
              model: CartItemExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
              include: [
                {
                  model: FoodExtra,
                  attributes: {
                    exclude: ["createdAt", "updatedAt"],
                  },
                },
              ],
            },
          ],
        });
        res.status(200).json({
          status: true,
          message: "Item quantity Increased",
          data: result,
        });
      } else {
        res.status(404).json({
          status: false,
          message: "Product not found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  });
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  var { address, phone_no, note } = req.body;
  try {
    var commision = await Fee.findOne({
      where: {
        type: "commission",
      },
    });

    await Order.findOne({
      where: {
        userId: req.user.id,
        new: true,
        paid: false,
      },
      include: [
        {
          model: CartItem,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Food,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: FoodExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: Package,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
        {
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    })
      .then(async (order) => {
        if (order) {
          var total = 0;
          if (order.fooditems) {
            for (var i = 0; i < order.fooditems.length; i++) {
              total = total + order.fooditems[i].price;
            }
          }
          paystack.transaction
            .initialize({
              name: `Food Order #${order.id}`,
              email: order.user.email,
              amount: parseInt(total + (commision.value / 100) * total) * 100,
              quantity: order.fooditems.length,
              callback_url: `${process.env.REDIRECT_SITE}/VerifyPay/food`,
              metadata: {
                userId: req.user.id,
                orderId: order.id,
              },
            })
            .then(async (transaction) => {
              console.log(transaction);
              if (transaction) {
                await Order.update(
                  {
                    address: address,
                    phone_no: phone_no,
                    note: note,
                    sub_total: total,
                    status: "in_progress",
                    checkout_url: transaction.data.authorization_url,
                    ref_no: transaction.data.reference,
                    access_code: transaction.data.access_code,
                    commission: parseInt((commision.value / 100) * total),
                  },
                  {
                    where: {
                      id: order.id,
                    },
                  }
                ).catch((err) => console.log(err));
              }
            })
            .catch((err) => console.log(err));

          const out = await Order.findOne({
            where: {
              id: order.id,
            },
            include: [
              {
                model: CartItem,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
                include: [
                  {
                    model: Food,
                    attributes: {
                      exclude: ["createdAt", "updatedAt"],
                    },
                  },
                  {
                    model: FoodExtra,
                    attributes: {
                      exclude: ["createdAt", "updatedAt"],
                    },
                  },
                  {
                    model: Package,
                    attributes: {
                      exclude: ["createdAt", "updatedAt"],
                    },
                  },
                ],
              },
              {
                model: User,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
            ],
          });
          res.status(201).json({
            status: true,
            message: "Order created",
            data: out,
          });
        } else {
          res.json({
            status: false,
            message: "No item found in your cart",
          });
        }
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getPaymentFood = async (req, res, next) => {
  var { address, phone_no, note, orderId, ref_no } = req.body;
  try {
    console.log(req.body);
    var commision = await Fee.findOne({
      where: {
        type: "commission",
      },
    });

    await Order.findOne({
      where: {
        userId: userId,
        new: true,
        paid: false,
      },
      include: [
        {
          model: CartItem,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Food,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: FoodExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: Package,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
        {
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    })
      .then(async (order) => {
        if (order) {
          var total = 0;
          if (order.fooditems) {
            for (var i = 0; i < order.fooditems.length; i++) {
              total = total + order.fooditems[i].price;
            }
          }

          console.log(transaction);
          if (transaction) {
            await Order.update(
              {
                address: address,
                phone_no: phone_no,
                note: note,
                sub_total: total,
                status: "in_progress",
                ref_no: ref_no,
                access_code: access_code,
                commission: parseInt((commision.value / 100) * total),
              },
              {
                where: {
                  id: order.id,
                },
              }
            ).catch((err) => console.log(err));
          }

          const out = await Order.findOne({
            where: {
              id: order.id,
            },
            include: [
              {
                model: CartItem,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
                include: [
                  {
                    model: Food,
                    attributes: {
                      exclude: ["createdAt", "updatedAt"],
                    },
                  },
                  {
                    model: FoodExtra,
                    attributes: {
                      exclude: ["createdAt", "updatedAt"],
                    },
                  },
                  {
                    model: Package,
                    attributes: {
                      exclude: ["createdAt", "updatedAt"],
                    },
                  },
                ],
              },
              {
                model: User,
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
            ],
          });
        } else {
          res.json({
            status: false,
            message: "No item found in your cart",
          });
        }
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.viewAppOrder = async (req, res, next) => {
  try {
    await Order.findOne({
      where: {
        id: req.params.orderId,
      },
      include: [
        {
          model: CartItem,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Food,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: FoodExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: Package,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
        {
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    }).then((order) => {
      if (order) {
        res.status(200).json({
          status: true,
          data: order,
        });
      } else {
        res.json({
          status: false,
          message: "No order found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  });
    next(error);
  }
};

exports.viewOrder = async (req, res, next) => {
  try {
    await Order.findOne({
      where: {
        id: req.params.orderId,
      },
      include: [
        {
          model: CartItem,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Food,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: FoodExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: Package,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
        {
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    }).then((order) => {
      if (order) {
        res.status(200).json({
          status: true,
          data: order,
        });
      } else {
        res.json({
          status: false,
          message: "No order found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  });
    next(error);
  }
};

exports.viewAdminOrder = async (req, res, next) => {
  try {
    await Order.findAll({
      where: {
        new: true,
        paid: true,
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: CartItem,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Food,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: FoodExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: Package,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
        {
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    }).then((order) => {
      if (order) {
        console.log("Orders found");
        store.set("order", JSON.stringify(order));
        let name = req.user.fullname.split(" ");
        let email = req.user.email;
        data = JSON.parse(store.get("order"));
        console.log(data);
        res.render("dashboard/admin/food-orders", {
          user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
          email: email,
          data,
        });
        next();
      } else {
        console.log("No Orders found");
        store.set("order", JSON.stringify(order));
        let name = req.user.fullname.split(" ");
        let email = req.user.email;
        data = JSON.parse(store.get("order"));
        console.log(data);
        res.render("dashboard/admin/food-orders", {
          user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
          email: email,
          data,
        });
        next();
      }
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  });
    next(error);
  }
};

exports.viewOrders = async (req, res, next) => {
  try {
    await Order.findAll({
      where: {
        userId: req.user.id,
        new: true,
        paid: true,
      },
      include: [
        {
          model: CartItem,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Food,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: FoodExtra,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: Package,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
        {
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    }).then((order) => {
      if (order) {
        res.status(200).json({
          status: true,
          data: order,
        });
      } else {
        res.json({
          status: false,
          message: "No order found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  });
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  try {
    if (status === "delivered" || status === "cancelled") {
      var new_order = false;
    } else {
      new_order = true;
    }
    await Order.update(
      {
        status: status,
        new: new_order,
      },
      {
        where: {
          id: req.params.orderId,
        },
      }
    );

    await Order.findOne({
      where: {
        id: req.params.orderId,
      },
    }).then((order) => {
      res.status(200).json({
        status: true,
        message: `Order ${status}`,
        data: order,
      });
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //      status: false,
    //      message: "An error occured",
    //      error: error
    //  });
    next(error);
  }
};

exports.Checkout = async (req, res, next) => {
  const ref = req.body.ref_no;
  const { email } = req.body;
  // const userId = req.user.id
  try {
    await Transaction.findOne({
      where: {
        ref_no: ref,
      },
    })
      .then(async (trn) => {
        if (trn) {
          var verify = "Payment Already Verified";
          // res.json("Payment Already Verified")
        } else {
          paystack.transaction
            .verify(ref)
            .then(async (transaction) => {
              console.log(transaction);
              // res.json(transaction)
              if (!transaction) {
                verify = `Transaction on the reference no: ${ref} not found`;
                // res.json({
                //     status: false,
                //     message: `Transaction on the reference no: ${ref} not found`
                // })
              }

              var trnx = new Transaction({
                userId: transaction.data.metadata.meta.userId,
                ref_no: ref,
                status: transaction.data.status,
                ProductType: "Food",
                price: `${transaction.data.currency} ${
                  transaction.data.amount / 100
                }`,
                description: `Food purchase #${transaction.data.metadata.meta.orderId}`,
              });
              var savetrnx = await trnx.save();

              await Order.update(
                {
                  paid: true,
                },
                {
                  where: {
                    id: transaction.data.metadata.meta.orderId,
                  },
                }
              );

              await CartItem.findAll({
                where: {
                  orderId: transaction.data.metadata.meta.orderId,
                },
              }).then(async (extra) => {
                if (extra) {
                  for (var i = 0; i < extra.length; i++) {
                    await CartItem.update(
                      {
                        ordered: true,
                      },
                      {
                        where: {
                          id: extra[i].id,
                        },
                      }
                    );
                  }
                }
              });

              var user = await User.findOne({
                where: {
                  id: transaction.data.metadata.meta.userId,
                },
              });

              let fname = user.fullname.split(" ");
              const mailOptions = {
                from: `"Deepend" <${process.env.E_TEAM}>`,
                to: `${user.email}`,
                subject: "Deepend",
                html: `
                <!DOCTYPE html>
                    <html>
                    <head>

                    <meta charset="utf-8">
                    <meta http-equiv="x-ua-compatible" content="ie=edge">
                    <title>${savetrnx.ProductType} Payment Confirmation</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style type="text/css">
                    /**
                     * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
                     */
                    @media screen {
                        @font-face {
                        font-family: 'Source Sans Pro';
                        font-style: normal;
                        font-weight: 400;
                        src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
                        }
                        @font-face {
                        font-family: 'Source Sans Pro';
                        font-style: normal;
                        font-weight: 700;
                        src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
                        }
                    }
                    /**
                     * Avoid browser level font resizing.
                     * 1. Windows Mobile
                     * 2. iOS / OSX
                     */
                    body,
                    table,
                    td,
                    a {
                        -ms-text-size-adjust: 100%; /* 1 */
                        -webkit-text-size-adjust: 100%; /* 2 */
                    }
                    /**
                     * Remove extra space added to tables and cells in Outlook.
                     */
                    table,
                    td {
                        mso-table-rspace: 0pt;
                        mso-table-lspace: 0pt;
                    }
                    /**
                     * Better fluid images in Internet Explorer.
                     */
                    img {
                        -ms-interpolation-mode: bicubic;
                    }
                    /**
                     * Remove blue links for iOS devices.
                     */
                    a[x-apple-data-detectors] {
                        font-family: inherit !important;
                        font-size: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                        color: inherit !important;
                        text-decoration: none !important;
                    }
                    /**
                     * Fix centering issues in Android 4.4.
                     */
                    div[style*="margin: 16px 0;"] {
                        margin: 0 !important;
                    }
                    body {
                        width: 100% !important;
                        height: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    /**
                     * Collapse table borders to avoid space between cells.
                     */
                    table {
                        border-collapse: collapse !important;
                    }
                    a {
                        color: #1a82e2;
                    }
                    img {
                        height: auto;
                        line-height: 100%;
                        text-decoration: none;
                        border: 0;
                        outline: none;
                    }
                    </style>

                    </head>
                    <body style="background-color: #e9ecef;">

                    <!-- start preheader -->
                    <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
                        ${savetrnx.ProductType} Payment confirmation
                    </div>
                    <!-- end preheader -->

                    <!-- start body -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">

                        <!-- start logo -->
                        <tr>
                        <td align="center" bgcolor="#e9ecef">
                            <!--[if (gte mso 9)|(IE)]>
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                            <tr>
                            <td align="center" valign="top" width="600">
                            <![endif]-->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td align="center" valign="top" style="padding: 36px 24px;">
                                <a href=${baseurl} target="_blank" style="display: inline-block;">
                                    <img src=${baseurl}/images/deep.png alt="Logo" border="0" width="60" style="display: flex; width: 60px; max-width: 60px; min-width: 60px;">
                                </a>
                                </td>
                            </tr>
                            </table>
                            <!--[if (gte mso 9)|(IE)]>
                            </td>
                            </tr>
                            </table>
                            <![endif]-->
                        </td>
                        </tr>
                        <!-- end logo -->

                        <!-- start hero -->
                        <tr>
                        <td align="center" bgcolor="#e9ecef">
                            <!--[if (gte mso 9)|(IE)]>
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                            <tr>
                            <td align="center" valign="top" width="600">
                            <![endif]-->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                                <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">${
                                  savetrnx.ProductType
                                } Payment confirmation</h1>
                                </td>
                            </tr>
                            </table>
                            <!--[if (gte mso 9)|(IE)]>
                            </td>
                            </tr>
                            </table>
                            <![endif]-->
                        </td>
                        </tr>
                        <!-- end hero -->

                        <!-- start copy block -->
                        <tr>
                        <td align="center" bgcolor="#e9ecef">
                            <!--[if (gte mso 9)|(IE)]>
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                            <tr>
                            <td align="center" valign="top" width="600">
                            <![endif]-->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

                            <!-- start copy -->
                            <tr>
                                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                        <h2> Hi ${fname[0]}, </h2>        
                                <p style="margin: 0;"> Receiving this email means, you have just purchased ${
                                  savetrnx.ProductType
                                } from Deepend and your was confrimed</p>
                                <br>
                                <p style="margin: 0;"><b>Payment Details: </b></p>
                                <br>
                                <p style="margin: 0;">Description: ${
                                  savetrnx.description
                                } </p>
                                <p style="margin: 0;">Reference number: ${
                                  savetrnx.ref_no
                                } </p>
                                <p style="margin: 0;">Payment Status: <b>${savetrnx.status.toUpperCase()}</b> </p>
                                <p style="margin: 0;">Price: ${
                                  savetrnx.price
                                } </p>
                                </td>
                            </tr>
                            <!-- end copy -->

                         <!-- start copy -->
                            <tr>
                                <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                                <p style="margin: 0;">Cheers,<br> Deepend Team</p>
                                </td>
                            </tr>
                            <!-- end copy -->

                            </table>
                            <!--[if (gte mso 9)|(IE)]>
                            </td>
                            </tr>
                            </table>
                            <![endif]-->
                        </td>
                        </tr>
                        <!-- end copy block -->

                        <!-- start footer -->
                        <tr>
                        <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                            <!--[if (gte mso 9)|(IE)]>
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                            <tr>
                            <td align="center" valign="top" width="600">
                            <![endif]-->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

                            <!-- start permission -->
                            <tr>
                                <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                                <p style="margin: 0;">You received this email because we received a payment confirmation from your DEEPEND account.</p>
                                </td>
                            </tr>
                            <!-- end permission -->

                            </table>
                            <!--[if (gte mso 9)|(IE)]>
                            </td>
                            </tr>
                            </table>
                            <![endif]-->
                        </td>
                        </tr>
                        <!-- end footer -->

                    </table>
                    <!-- end body -->

                    </body>
                    </html>`,
              };

              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(info);
                }
              });

              verify = "Payment" + " " + transaction.message;

              res.json({
                status: true,
                message: `Payment ${transaction.message}`,
                transaction: savetrnx,
              });
              // res.render("base/verify-food", {
              //     verify
              // })
            })
            .catch((error) => console.error(error));
        }
      })
      .catch((error) => console.error(error));
  } catch (error) {
    console.error(error);
    next(error);
  }
};
