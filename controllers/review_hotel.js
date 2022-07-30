const Review = require("../model/reviewhotel");
const Hotel = require("../model/hotel");
// const Package = require("../model/hotelextras");
const Image = require("../model/hotelimage");
const Extra = require("../model/hotelextras")
const User = require('../model/user');


exports.addHotelReview = async(req, res, next)=>{
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
                    hotelId: req.params.hotelId,
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


exports.getHotelReviews = async(req, res, next)=>{
    try {
        await Review.findAll({
            where:{
                hotelId: req.params.hotelId   
            },
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Hotel,
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

exports.getUserHotelReviews = async(req, res, next)=>{
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
                    model: Hotel,
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

exports.getUserHotelReview = async(req, res, next)=>{
    try {
        await Review.findOne({
            where:{
                userId: req.params.userId,
                hotelId: req.params.hotelId
            },
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Hotel,
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


exports.getAllHotelReviews = async(req, res, next)=>{
    try {
        await Review.findAll({
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Hotel,
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

exports.deleteHotelReview = async(req, res, next)=>{
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