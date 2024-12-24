const joi=require("joi");

const reviewSchema = joi.object({
    rating: joi.number().required().min(1).max(5),
    comment: joi.string().required(),
});

module.exports = reviewSchema;