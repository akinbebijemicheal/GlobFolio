const Review = require("../model/reviewfood");
const Food = require("../model/food");
const Package = require("../model/foodpackaging");
const Image = require("../model/foodimage");
const Extra = require("../model/foodextras")
const User = require('../model/user');


exports.addFoodReview = async(req, res, next)=>{
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
                    foodId: req.params.foodId,
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


exports.getFoodReviews = async(req, res, next)=>{
    try {
        await Review.findAll({
            where:{
                foodId: req.params.foodId   
            },
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Food,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    },
                    include:[
                        {
                            model: Extra,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        },
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

exports.getUserFoodReviews = async(req, res, next)=>{
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
                    model: Food,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    },
                    include:[
                        {
                            model: Extra,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        },
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

exports.getUserFoodReview = async(req, res, next)=>{
    try {
        await Review.findOne({
            where:{
                userId: req.params.userId,
                foodId: req.params.foodId
            },
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Food,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    },
                    include:[
                        {
                            model: Extra,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        },
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


exports.getAllFoodReviews = async(req, res, next)=>{
    try {
        await Review.findAll({
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Food,
                    attributes:{
                        excludes: ["createdAt", "updatedAt"]
                    },
                    include:[
                        {
                            model: Extra,
                            attributes:{
                                excludes: ["createdAt", "updatedAt"]
                            }
                        },
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

exports.deleteFoodReview = async(req, res, next)=>{
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