const Product = require("../../model/food");
const Extras = require("../../model/foodextras");
const Review = require("../../model/reviewfood");
const Package = require("../../model/foodpackaging");
const Image = require("../../model/foodimage");
const cloudinary = require("../../util/cloudinary");
const User = require("../../model/user");
const fs = require("fs");
const store = require("store");
const Food = require("../../model/food");
const CartItem = require("../../model/cartItem");
const CartItemExtra = require("../../model/cartitemextra");

exports.createFoodService = async (req, res, next) => {
  const { title, description, price } = req.body;

  try {
    const food = new Product({
      title,
      description,
      price: price,
    });
    const foodout = await food.save();

    if (req.files || req.file) {
      const uploader = async (path) =>
        await cloudinary.uploads(path, "foodImages");
      var urls = [];
      var ids = [];
      const files = req.files;
      for (const file of files) {
        const { path } = file;
        console.log(path);
        const newPath = await uploader(path);
        console.log(newPath);
        urls.push(newPath.url);
        ids.push(newPath.id);
        console.log(newPath.url, newPath.id);
        fs.unlinkSync(path);
      }

      var foodimage = (id, url) => {
        var imageoutput = [];
        for (let i = 0; i < id.length; i++) {
          imageoutput.push({
            foodId: foodout.id,
            img_id: id[i],
            img_url: url[i],
          });
        }
        return imageoutput;
      };

      await Image.bulkCreate(foodimage(ids, urls), { returning: true });
    }

    if (req.body.top && req.body.topPrice) {
      if (Array.isArray(req.body.top)) {
        var top_price = (top, price) => {
          var output = [];
          for (let i = 0; i < top.length; i++) {
            output.push({
              foodId: foodout.id,
              topping: top[i],
              price: price[i],
            });
          }
      console.log(output);

          return output;
        };
      } else {
        top_price = (top, price) => {
          var output = [];
          output.push({
            foodId: foodout.id,
            topping: top,
            price: price,
          });
      console.log(output);

          return output;
        };
      }


      //console.log(top_price(req.body.top, req.body.topPrice));
      var extra = await Extras.bulkCreate(
        top_price(req.body.top, req.body.topPrice),
        { returning: true }
      );
      console.log("extra", extra);
    }

    if (req.body.packageName && req.body.packagePrice) {
      if (Array.isArray(req.body.packageName)) {
        var package_price = (package, price) => {
          var output = [];
          for (let i = 0; i < package.length; i++) {
            output.push({
              foodId: foodout.id,
              name: package[i],
              price: price[i],
            });
          }
          return output;
        };
      } else {
        package_price = (package, price) => {
          var output = [];
          output.push({
            foodId: foodout.id,
            name: package,
            price: price,
          });

          return output;
        };
      }

      //console.log(top_price(req.body.top, req.body.topPrice));
      var packaging = await Package.bulkCreate(
        package_price(req.body.packageName, req.body.packagePrice),
        { returning: true }
      );
    }

    var out = await Product.findOne({
      where: {
        id: foodout.id,
      },
      include: [
        {
          model: Extras,
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
        {
          model: Image,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    });

    res.redirect("/dashboard/admin/food-products");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.foodCount = async (rea, res, next) => {
  try {
    const foods = await Product.count({ raw: true });
    if (foods) {
      store.set("foods", foods);
      console.log("foods found:", foods);

      next();
    } else {
      console.log("no foods", foods);
      store.set("foods", foods);

      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occured refresh the page",
    });
    next(error);
    // req.flash("error", "An error occured refresh the page")
  }
};

exports.getFoodAppServices = async (req, res, next) => {
  try {
    const length = req.query.length;

    var food = await Product.findAll({
      include: [
        {
          model: Extras,
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
        {
          model: Image,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: Review,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: User,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    if (food) {
      if (food.length <= length || length === "" || !length) {
        res.status(200).json({
          status: true,
          data: food,
        });
      } else {
        let begin = length - 10;
        let end = length + 1;
        var sliced = food.slice(begin, end);
        res.status(200).json({
          status: true,
          data: sliced,
        });
      }
    } else {
      res.status(404).json({
        status: true,
        message: "Posts not Found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getFoodServices = async (req, res, next) => {
  try {
    const length = req.query.length;

    var food = await Product.findAll({
      include: [
        {
          model: Extras,
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
        {
          model: Image,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: Review,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: User,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
      // raw: true
    });

    if (food) {
      if (food.length <= length || length === "" || !length) {
        // res.status(200).json({
        //     status: true,
        //     data: food
        // });

        // console.log(food)
        var foodstring = JSON.stringify(food);
        store.set("food", foodstring);
        let name = req.user.fullname.split(" ");
        let email = req.user.email;
        data = JSON.parse(store.get("food"));
        console.log(data);
        res.render("dashboard/admin/food-products", {
          user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
          email: email,
          data: data,
        });
        next();
      } else {
        let begin = length - 10;
        let end = length + 1;
        var sliced = food.slice(begin, end);
        // res.status(200).json({
        //     status: true,
        //     data: sliced
        // });
        console.log(food);
        var foodstring = JSON.stringify(food);
        store.set("food", foodstring);
        let name = req.user.fullname.split(" ");
        let email = req.user.email;
        data = JSON.parse(store.get("food"));
        res.render("dashboard/admin/food-products", {
          user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
          email: email,
          data: data,
        });
        next();
      }
    } else {
      // res.status(404).json({
      //     status: true,
      //     message: "Posts not Found"
      // })
      console.log("no food uploaded");
      var foodstring = JSON.stringify(food);
      store.set("food", foodstring);
      let name = req.user.fullname.split(" ");
      let email = req.user.email;
      data = JSON.parse(store.get("food"));
      res.render("dashboard/admin/food-products", {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email,
        data: data,
      });
      next();
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getFoodByTitle = async (req, res, next) => {
  const { title } = req.body;
  try {
    var food = await Product.findOne({
      where: {
        title: title,
      },
      include: [
        {
          model: Extras,
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
        {
          model: Image,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: Review,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: User,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
      ],
    });
    if (food) {
      res.status(200).json({
        status: true,
        data: food,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Post not Found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getFoodById = async (req, res, next) => {
  const id = req.params.id;
  try {
    var food = await Product.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: Extras,
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
        {
          model: Image,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: Review,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: User,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
      ],
    });

    if (food) {
      res.status(200).json({
        status: true,
        data: food,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Post not Found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getFoodByIdAdmin = async (req, res, next) => {
  const id = req.params.id;
  try {
    var food = await Product.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: Extras,
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
        {
          model: Image,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: Review,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: User,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
      ],
    });

    if (food) {
      console.log("foods found");
      store.set("food", JSON.stringify(food));
      let name = req.user.fullname.split(" ");
      let email = req.user.email;
      data = JSON.parse(store.get("food"));
      console.log(data);
      console.log(data.foodextras);
      var img = data["foodimages"];

      // if(img.length){ for(var i=0; i< img.length; i++) {
      //     console.log('image found :',i ,img[i].img_url)
      // }}else{

      // }

      res.render("dashboard/admin/food-view", {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email,
        data: data,
        img: img,
      });
    } else {
      req.flash("error", "food with id not found");
      res.redirect("/dashboard/admin/");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateFood = async (req, res, next) => {
  
  try {
    const {
      title,
      description,
      price,
      packageId,
      packageName,
      packagePrice,
      topId,
      top,
      topPrice,
    } = req.body;
    console.log(req.body);
    const food = await Product.findOne({
      where: {
        id: req.params.foodId,
      },
      include: [
        {
          model: Extras,
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
        {
          model: Image,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    });

    //update foodextras
let output;
    if (req.body.top && req.body.topPrice) {
      if (Array.isArray(req.body.top)) {
         output = [];
         
        for (let i = 0; i < top.length; i++) {
          output.push({
            foodId: food.id,
            topId: topId[i],
            topping: top[i],
            price: topPrice[i],
          });
        }
      } else {
         output = [];
        
        output.push({
          foodId: food.id,
          topId: topId,
          topping: top,
          price: topPrice,
        });
      }
    }

    console.log(output);
    for (let i = 0; i < output.length; i++) {
      let extrasup = await Extras.findOne({
        where: { foodId: output[i].foodId, id: output[i].topId },
      });
      console.log(extrasup)

      if (extrasup !== null) {
        await Extras.update(
          {
            topping: output[i].topping,
            price: output[i].price,
          },
          {
            where: {
              id: extrasup.id,
            },
          }
        );
      } else {
        let extrasout = new Extras({
          foodId: output[i].foodId,
          topping: output[i].topping,
          price: output[i].price,
        });
        let Eout = await extrasout.save();
        console.log(Eout);
      }
    }

    //update food packaging
let Poutput;
      if (req.body.packageName && req.body.packagePrice) {
      if (Array.isArray(req.body.packageName)) {
          Poutput = [];
          console.log(Poutput)
          for (let i = 0; i < packageName.length; i++) {
            Poutput.push({
              foodId: food.id,
              packageId: packageId[i],
              name: packageName[i],
              price: packagePrice[i],
            });
          }
       
        
      } else {
          Poutput = [];
          Poutput.push({
            foodId: food.id,
            packageId: packageId,
            name: packageName,
            price: packagePrice,
          });

        
      }
    }
    console.log(Poutput);
    for (let i = 0; i < Poutput.length; i++) {
      let packageup = await Package.findOne({
        where: { foodId: Poutput[i].foodId, id: Poutput[i].packageId },
      });
console.log("gg", packageup)
      if (packageup !== null) {
       await Package.update(
         {
           name: Poutput[i].name,
           price: Poutput[i].price,
         },
         {
           where: {
             id: packageup.id,
           },
         }
       );
        console.log("hello", packageup.id);

      } else {
        let packageout = new Package({
          foodId: Poutput[i].foodId,
          name: Poutput[i].name,
          price: Poutput[i].price,
        });
        let Pout = await packageout.save();
        console.log(Pout);
      }
    }

    //update food

    await Product.update(
      {
        title: title,
        description: description,
        price: price,
      },
      {
        where: {
          id: req.params.foodId,
        },
      }
    );
req.flash("success", "Food successfully updated")
    res.redirect("/dashboard/admin/food-view/"+req.params.foodId);
  } catch (error) {
    console.error(error);
  }
};

exports.deleteFood = async (req, res, next) => {
  const id = req.params.id;
  try {
    await Product.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: Extras,
        },
        {
          model: Package,
        },
        {
          model: Image,
        },
        {
          model: CartItem,
          include: [
            {
              model: CartItemExtra,
            },
          ],
        },
      ],
    }).then(async (food) => {
      // console.log(food)
      if (food) {
        if (food.fooditems?.length) {

          await CartItem.findAll({
            where: {
              foodId: food.id,
            },
            include: [
              {
                model: CartItemExtra,
              },
            ],
          }).then(async (fooditems) => {
            if (fooditems?.length) {
              for (var i = 0; i < fooditems.length; i++) {

                //delete cartitem extra for all cartitem

            
                if (fooditems[i].fooditemextras?.length) {
                  await CartItemExtra.findAll({
                    where: {
                      cartItemId: fooditems[i].id,
                    },
                  }).then(async (fooditemextras) => {
                    if (fooditemextras?.length) {
                      for (var b = 0; b < fooditemextras.length; b++) {
                        await CartItemExtra.destroy({
                          where: {
                            id: fooditemextras[b].id,
                          },
                        });
                      }
                    }
                  });
                }

                //delete cartitem
                await CartItem.destroy({
                  where: {
                    id: fooditems[i].id,
                  },
                });
              }
            }
          });
        }

        if (food.foodextras?.length) {
          await Extras.findAll({
            where: {
              foodId: food.id,
            },
          }).then(async (extras) => {
            if (extras?.length) {
              for (var i = 0; i < extras.length; i++) {
                await Extras.destroy({
                  where: {
                    id: extras[i].id,
                    foodId: food.id,
                  },
                });
              }
            }
          });
        }
        if (food.foodpackagings?.length) {
          await Package.findAll({
            where: {
              foodId: food.id,
            },
          }).then(async (package) => {
            if (package?.length) {
              for (var i = 0; i < package.length; i++) {
                await Package.destroy({
                  where: {
                    id: package[i].id,
                    foodId: food.id,
                  },
                });
              }
            }
          });
        }


        
        if (food.foodimages?.length) {
          await Image.findAll({
            where: {
              foodId: food.id,
            },
          }).then(async (image) => {
            if (image?.length) {
              for (var i = 0; i < image.length; i++) {
                await Image.destroy({
                  where: {
                    id: image[i].id,
                  },
                });
              }
            }
          });
        }

        await Product.destroy({
          where: {
            id: food.id,
          },
        });
        console.log("success");
        res.redirect("/dashboard/admin/food-products");
      } else {
        req.flash("error", "food not found");
        console.log("error");
        res.redirect("/dashboard/admin/food-products");
      }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.uploadFoodImage = async (req, res, next) => {
  try {
    if (req.files || req.file) {
      const uploader = async (path) =>
        await cloudinary.uploads(path, "foodImages");
      var urls = [];
      var ids = [];
      const files = req.files;
      for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path);
        urls.push(newPath.url);
        ids.push(newPath.id);
        fs.unlinkSync(path);
      }

      var foodimage = (id, url) => {
        var imageoutput = [];
        for (let i = 0; i < id.length; i++) {
          imageoutput.push({
            foodId: req.params.foodId,
            img_id: id[i],
            img_url: url[i],
          });
        }
        return imageoutput;
      };

      var output = await Image.bulkCreate(foodimage(ids, urls), {
        returning: true,
      });
    }

    res.status(200).json({
      status: true,
      message: "Image added",
      data: output,
    });
  } catch {
    console.error(error);
    next(error);
  }
};

exports.RemoveFoodImage = async (req, res, next) => {
  try {
    await Image.findOne({
      where: {
        id: req.params.imageId,
      },
    }).then(async (image) => {
      if (image) {
        await cloudinary.cloudinary.uploader.destroy(image.img_id);
        await Image.destroy({
          where: {
            id: image.id,
          },
        });

        res.status(200).json({
          status: true,
          message: "Image Removed",
        });
      } else {
        res.status(404).json({
          status: false,
          message: "Image Not Found",
        });
      }
    });
  } catch {
    console.error(error);
    next(error);
  }
};

// exports.deleteFood = async (req, res, next) => {
//     //const {title, ref_link} = req.body
//     try {
//       var food = await Product.findOne({
//         where: {
//           id: req.params.id,
//         }
//       }).then(async (food) => {
//         if (food) {
//         //   await cloudinary.uploader.destroy(Image.img_id);
//           console.log(food)
//           await Product.destroy({
//             where: {
//               id: req.params.id,
//             }, include:[
//                 {
//                     model: Extras
//                 },
//                 {
//                     model: Package
//                 },
//                 {
//                     model: Image
//                 }
//             ]
//           });
//           console.log("success")
//           res.redirect("/dashboard/admin/food-products")
//         } else {
//           req.flash("error","food not found")
//           console.log("error")
//           res.redirect("/dashboard/admin/food-products")
//         }
//       });
//     } catch (error) {
//       console.error(error);
//       return next(error);
//     }
//   };
