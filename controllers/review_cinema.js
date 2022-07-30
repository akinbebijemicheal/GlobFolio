const Review = require("../model/reviewcinema");
const Cinema = require("../model/cinema");
const Package = require("../model/cinemasnacks");
const Image = require("../model/cinemaimage");
const User = require('../model/user');


exports.addCinemaReview = async(req, res, next)=>{
    const {rating, comment} = req.body;
    try {
        if(rating > 5){
            res.json({
                status: false,
                message: "Rating can't be more than five"
            })
        }
        await Review.findOne({
            where:{
                userId: req.user.id
            }
        })
        .then(async(review)=>{
            if(review){
                res.json({
                    status: false,
                    message: "User can only review once"
                })
            }else{
                const new_review = new Review({
                    userId: req.user.id,
                    cinemaId: req.params.cinemaId,
                    rating: rating,
                    comment: comment
                })

                await new_review.save();

                res.status(200).json({
                    status: true,
                    message: "Review sent"
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error);
    }
}


exports.getCinemaReviews = async(req, res, next)=>{
    try {
        await Review.findAll({
            where:{
                cinemaId: req.params.cinemaId   
            },
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Cinema,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    },
                    include:[
                        {
                            model: Image,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        },
                        {
                            model: Package,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        }
                    ]
                },
                {
                    model: User,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    }
                }
            ]
        }).then(review=>{
            if(review){
                res.json({
                    status: true,
                    data: review
                })
            }else{
                res.json({
                    status: false,
                    message: "No review found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}

exports.getUserCinemaReviews = async(req, res, next)=>{
    try {
        await Review.findAll({
            where:{
                userId: req.params.userId
            },
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Cinema,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    },
                    include:[
                        {
                            model: Image,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        },
                        {
                            model: Package,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        }
                    ]
                },
                {
                    model: User,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    }
                }
            ]
        }).then(review=>{
            if(review){
                res.json({
                    status: true,
                    data: review
                })
            }else{
                res.json({
                    status: false,
                    message: "No review found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}

exports.getUserCinemaReview = async(req, res, next)=>{
    try {
        await Review.findOne({
            where:{
                userId: req.params.userId,
                cinemaId: req.params.cinemaId
            },
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Cinema,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    },
                    include:[
                        {
                            model: Image,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        },
                        {
                            model: Package,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        }
                    ]
                },
                {
                    model: User,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    }
                }
            ]
        }).then(review=>{
            if(review){
                res.json({
                    status: true,
                    data: review
                })
            }else{
                res.json({
                    status: false,
                    message: "No review found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}


exports.getAllCinemaReviews = async(req, res, next)=>{
    try {
        await Review.findAll({
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Cinema,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    },
                    include:[
                        {
                            model: Image,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        },
                        {
                            model: Package,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        }
                    ]
                },
                {
                    model: User,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    }
                }
            ]
        }).then(review=>{
            if(review){
                res.json({
                    status: true,
                    data: review
                })
            }else{
                res.json({
                    status: false,
                    message: "No review found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}

exports.deleteCinemaReview = async(req, res, next)=>{
    try {
        await Review.findOne({
            where: {
                id: req.params.reviewId
            }
        })
        .then(async(review)=>{
            if(review){
                await Review.destroy({
                    where:{
                        id: review.id
                    }
                })
                res.json({
                    status: true,
                    message: "Review deleted"
                })
            }else{
                res.json({
                    status: false,
                    message: "Review not found"
                })
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}