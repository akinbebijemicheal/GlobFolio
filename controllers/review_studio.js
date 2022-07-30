const Review = require("../model/reviewstudio");
const Studio = require("../model/studio_book");
// const Package = require("../model/foodpackaging");
const Image = require("../model/studio_book_image");
// const Extra = require("../model/foodextras")
const User = require('../model/user');


exports.addStudioReview = async(req, res, next)=>{
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
                    studioId: req.params.studioId,
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


exports.getStudioReviews = async(req, res, next)=>{
    try {
        await Review.findAll({
            where:{
                studioId: req.params.studioId   
            },
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Studio,
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

exports.getUserStudioReviews = async(req, res, next)=>{
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
                    model: Studio,
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

exports.getUserStudioReview = async(req, res, next)=>{
    try {
        await Review.findOne({
            where:{
                userId: req.params.userId,
                studioId: req.params.studioId
            },
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Studio,
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


exports.getAllStudioReviews = async(req, res, next)=>{
    try {
        await Review.findAll({
            order:[
                'createdAt', 'ASC'
            ],
            include:[
                {
                    model: Studio,
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

exports.deleteStudioReview = async(req, res, next)=>{
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