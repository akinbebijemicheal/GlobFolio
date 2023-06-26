const Product = require('../../model/cinema');
const Image = require("../../model/cinemaimage");
const cloudinary = require('../../util/cloudinary');
const Review = require("../../model/reviewcinema")
// const Time = require("../../model/cinematime");
const Snack = require("../../model/cinemasnacks")
const User = require('../../model/user');
const { Op } = require('sequelize')
const fs = require('fs')
const store = require('store');

exports.createCinemaService = async (req, res, next) => {
    const { title, genre, storyline, rating, view_date, cast, seat, duration, age_rate, price, morningTime, afternoonTime, eveningTime, snackName, snackPrice } = req.body;
    try {

        const cinema = new Product({
            title,
            genre,
            storyline,
            cast,
            duration,
            age_rate,
            view_date,
            seat,
            morning: morningTime,
            evening: eveningTime,
            afternoon: afternoonTime,
            rating: parseFloat(rating),
            price: price,
        })
        var cinemaout = await cinema.save();

        if (cinemaout) {

            if (snackName && snackPrice) {
                if (Array.isArray(snackName)) {
                    var snack_price = (Name, Price) => {
                        var output = [];
                        for (let i = 0; i < Name.length; i++) {
                            output.push({
                                cinemaId: cinemaout.id,
                                name: Name[i],
                                price: Price[i]
                            });
                        };
                        return output;
                    }
                } else {
                    snack_price = (Name, Price) => {
                        var output = [];
                        output.push({
                            cinemaId: cinemaout.id,
                            name: Name,
                            price: Price
                        });
                        return output;
                    }
                }
                await Snack.bulkCreate(snack_price(snackName, snackPrice), { returning: true })
            }


        }

        if (req.file || req.files) {
            const uploader = async (path) => await cloudinary.uploads(path, 'cinemaImages');

            const urls = [];
            const ids = []
            const files = req.files;
            for (const file of files) {
                const { path } = file;
                const newPath = await uploader(path)
                urls.push(newPath.url);
                ids.push(newPath.id)
                fs.unlinkSync(path)
            }

            var cinemaImages = (id, url) => {
                var imageoutput = []
                for (let i = 0; i < id.length; i++) {
                    imageoutput.push({
                        cinemaId: cinemaout.id,
                        img_id: id[i],
                        img_url: url[i]
                    });
                }
                return imageoutput;
            }

            await Image.bulkCreate(cinemaImages(ids, urls), { returning: true });
        }

        var out = await Product.findOne({
            where: {
                id: cinemaout.id
            }, include: [
                {
                    model: Image,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Snack,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                }
            ]
        })

        res.redirect("/dashboard/admin/get-cinema-posts")

    } catch (error) {
        console.error(error)
        next(error);
    }
}

exports.getCinemaAppServices = async (req, res, next) => {
    const status = req.query.status;
    const length = req.query.length
    try {
        if (status === "showing") {
            var cinema = await Product.findAll({
                where: {
                    view_date: (new Date).toISOString().substr(0, 10)
                },
                order: [
                    ['view_date', 'ASC']
                ],
                include: [
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Snack,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Review,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                        include: [
                            {
                                model: User,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        ]
                    }

                ]
            });


        }

        if (status === "soon") {
            cinema = await Product.findAll({
                where: {
                    view_date: {
                        [Op.gt]: (new Date).toISOString().substr(0, 10)
                    }
                }, order: [
                    ['view_date', 'ASC']
                ],
                include: [
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Snack,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Review,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                        include: [
                            {
                                model: User,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        ]
                    }
                ]
            });

        }

        if (status === "rated") {
            var cinema = await Product.findAll({
                order: [
                    ['rating', 'DESC'],
                    ['view_date', 'ASC']
                ],
                include: [
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Snack,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Review,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                        include: [
                            {
                                model: User,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        ]
                    }
                ]
            });

        }

        if (!status) {
            var cinema = await Product.findAll({
                order: [
                    ['view_date', 'ASC']
                ],

                include: [
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Snack,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Review,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                        include: [
                            {
                                model: User,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        ]
                    }
                ]
            });

        }

        if (cinema) {

            if (cinema.length <= length || length === "" || !length) {
                res.status(200).json({
                    status: true,
                    data: cinema
                });
            } else {
                let begin = length - 10;
                let end = length + 1;
                var sliced = cinema.slice(begin, end);

                res.status(200).json({
                    status: true,
                    data: sliced
                });
            }

        } else {
            res.status(404).json({
                status: true,
                message: "Posts not Found"
            })
        }
    } catch (error) {
        console.error(error)
        next(error);
    }
}


exports.cinemaCount = async (rea, res, next) => {
    try {
        const cinemas = await Product.count()
        if (cinemas) {
            store.set("cinemas", cinemas);
            console.log('cinemas found:', cinemas)

            next();

        } else {
            console.log("no cinemas", cinemas)
            store.set("cinemas", cinemas);

            next();
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: false,
            message: "An error occured refresh the page"
        })
        next(error)
        // req.flash("error", "An error occured refresh the page")
    }
}

exports.getCinemaServices = async (req, res, next) => {
    const status = req.query.status;
    const length = req.query.length
    try {
        if (status === "showing") {
            var cinema = await Product.findAll({
                where: {
                    view_date: (new Date).toISOString().substr(0, 10)
                },
                order: [
                    ['view_date', 'ASC']
                ],
                include: [
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Snack,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Review,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                        include: [
                            {
                                model: User,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        ]
                    }
                ]
            });


        }

        if (status === "soon") {
            cinema = await Product.findAll({
                where: {
                    view_date: {
                        [Op.gt]: (new Date).toISOString().substr(0, 10)
                    }
                }, order: [
                    ['view_date', 'ASC']
                ],
                include: [
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Snack,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Review,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                        include: [
                            {
                                model: User,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        ]
                    }
                ]
            });

        }

        if (status === "rated") {
            var cinema = await Product.findAll({
                order: [
                    ['rating', 'DESC'],
                    ['view_date', 'ASC']
                ],
                include: [
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Snack,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Review,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                        include: [
                            {
                                model: User,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        ]
                    }
                ]
            });

        }

        if (!status) {
            var cinema = await Product.findAll({
                order: [
                    ['view_date', 'ASC']
                ],

                include: [
                    {
                        model: Image,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Snack,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        }
                    },
                    {
                        model: Review,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"]
                        },
                        include: [
                            {
                                model: User,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"]
                                },
                            }
                        ]
                    }
                ]
            });

        }

        if (cinema) {

            if (cinema.length <= length || length === "" || !length) {
                console.log("cinemas found")
                store.set("cinema", JSON.stringify(cinema));
                let name = req.user.fullname.split(" ");
                let email = req.user.email;
                data = JSON.parse(store.get("cinema"));
                console.log(data)
                res.render("dashboard/admin/cinemas", {
                    user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                    email: email,
                    data
                });
                next();
            } else {
                let begin = length - 10;
                let end = length + 1;
                var sliced = cinema.slice(begin, end);

                console.log("cinemas found")
                store.set("cinema", JSON.stringify(cinema));
                let name = req.user.fullname.split(" ");
                let email = req.user.email;
                data = JSON.parse(store.get("cinema"));
                console.log(data)
                res.render("dashboard/admin/cinemas", {
                    user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                    email: email,
                    data
                });
                next();
            }

        } else {
            console.log("No cinemas found")
            store.set("cinema", JSON.stringify(cinema));
            let name = req.user.fullname.split(" ");
            let email = req.user.email;
            data = JSON.parse(store.get("cinema"));
            console.log(data)
            res.render("dashboard/admin/cinemas", {
                user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                email: email,
                data
            });
            next();
        }
    } catch (error) {
        console.error(error)
        next(error);
    }
}

exports.getCinemaByTitle = async (req, res, next) => {
    const { title } = req.body;
    try {
        var cinema = await Product.findAll({
            where: {
                title: title
            },
            include: [
                {
                    model: Image,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Snack,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Review,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    },
                    include: [
                        {
                            model: User,
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                        }
                    ]
                }
            ]
        })
        if (cinema) {
            res.status(200).json({
                status: true,
                data: cinema
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Post not Found"
            })
        }
    } catch (error) {
        console.error(error)
        next(error);
    }
}
exports.getCinemaById = async (req, res, next) => {
    const id = req.params.id;
    try {
        var cinema = await Product.findOne({
            where: {
                id: id,
            },
            include: [
                {
                    model: Image,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Snack,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Review,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    },
                    include: [
                        {
                            model: User,
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                        }
                    ]
                }
            ]
        })
        if (cinema) {
            res.status(200).json({
                status: true,
                data: cinema
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Post not Found"
            })
        }
    } catch (error) {
        console.error(error)
        next(error);
    }
}

exports.getCinemaByIdAdmin = async (req, res, next) => {
    const id = req.params.id;
    try {
        var cinema = await Product.findOne({
            where: {
                id: id,
            },
            include: [
                {
                    model: Image,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Snack,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    }
                },
                {
                    model: Review,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"]
                    },
                    include: [
                        {
                            model: User,
                            attributes: {
                                exclude: ["createdAt", "updatedAt"]
                            },
                        }
                    ]
                }
            ]
        })
        if (cinema) {
            console.log("cinemas found")
            store.set("cinema", JSON.stringify(cinema));
            let name = req.user.fullname.split(" ");
            let email = req.user.email;
            data = JSON.parse(store.get("cinema"));
            console.log(data);
            var img = data['cinemaimages']

            // if(img.length){ for(var i=0; i< img.length; i++) {
            //     console.log('image found :',i ,img[i].img_url)
            // }}else{

            // }

            res.render("dashboard/admin/cinema-view", {
                user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
                email: email,
                data: data,
                img: img
            });

        } else {
            req.flash("error", "cinema with id not found")
            res.redirect("/dashboard/admin/")
        }
    } catch (error) {
        console.error(error)
        next(error);
    }
}

exports.updateCinema = async (req, res, next) => {
    const { title, genre, storyline, rating, view_date, cast, seat, duration, age_rate, price, morningTime, afternoonTime, eveningTime } = req.body;
    try {

        await Product.update({
            title: title,
            genre: genre,
            storyline: storyline,
            cast: cast,
            view_date: view_date,
            duration: duration,
            age_rate: age_rate,
            seat: seat,
            morning: morningTime,
            afternoon: afternoonTime,
            evening: eveningTime,
            rating: parseFloat(rating),
            price: price,
        }, {
            where: {
                id: req.params.id
            }
        })

        res.status(200).json({
            status: true,
            message: "Post updated"
        })


    } catch {
        console.error(error)
        next(error);
    }
}

exports.uploadCinemaImage = async (req, res, next) => {
    try {
        if (req.files || req.file) {
            const uploader = async (path) => await cloudinary.uploads(path, 'cinemaImages');
            var urls = [];
            var ids = []
            const files = req.files;
            for (const file of files) {
                const { path } = file;
                const newPath = await uploader(path)
                urls.push(newPath.url);
                ids.push(newPath.id)
                fs.unlinkSync(path)
            }

            var cinemaimage = (id, url) => {
                var imageoutput = []
                for (let i = 0; i < id.length; i++) {
                    imageoutput.push({
                        cinemaId: req.params.cinemaId,
                        img_id: id[i],
                        img_url: url[i]
                    });
                }
                return imageoutput;
            }

            var output = await Image.bulkCreate(cinemaimage(ids, urls), { returning: true });
        }

        res.status(200).json({
            status: true,
            message: "Image added",
            data: output
        })


    } catch {
        console.error(error)
        next(error);
    }
}

exports.RemoveCinemaImage = async (req, res, next) => {
    try {

        await Image.findOne({
            where: {
                id: req.params.imageId
            }
        }).then(async (image) => {
            if (image) {
                await cloudinary.cloudinary.uploader.destroy(image.img_id);
                await Image.destroy({
                    where: {
                        id: image.id
                    }
                });

                res.status(200).json({
                    status: true,
                    message: "Image Removed",
                })
            } else {
                res.status(404).json({
                    status: false,
                    message: "Image Not Found",
                })
            }
        })

    } catch {
        console.error(error)
        next(error);
    }
}

exports.deleteCinema = async (req, res, next) => {
    const id = req.params.id;
    try {
        await Product.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Snack,

                },
                {
                    model: Image,

                }
            ]
        }).then(async (cinema) => {
            if (cinema) {
                if (cinema.cinemasnacks?.length) {
                    await Snack.findAll({
                        where: {
                            cinemaId: cinema.id
                        }
                    }).then(async (snacks) => {
                        if (snacks?.length) {
                            for (var i = 0; i < snacks.length; i++) {
                                await Snack.destroy({
                                    where: {
                                        id: snacks[i].id
                                    }
                                })
                            }
                        }
                    })
                }

                if (cinema.cinemaimages?.length) {
                    await Image.findAll({
                        where: {
                            cinemaId: cinema.id
                        }
                    }).then(async (image) => {
                        if (image?.length) {
                            for (var i = 0; i < image.length; i++) {
                                await Image.destroy({
                                    where: {
                                        id: image[i].id
                                    }
                                })
                            }
                        }
                    })
                }

                await Product.destroy({
                    where: {
                        id: cinema.id
                    }
                })
                console.log("success")
                res.redirect("/dashboard/admin/get-cinema-posts")
            } else {
                req.flash("error", "cinema not found")
                console.log("error")
                res.redirect("/dashboard/admin/get-cinema-posts")
            }
        })
    } catch (error) {
        console.error(error);
        next(error)
    }
}