
const Listing = require("./models/listings");
const Review = require("./models/reviews");

module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        // console.log(req.originalUrl);
        req.session.originalUrl = req.originalUrl;
        req.flash("error","you must be logged in.");
        res.redirect("/login");
    }
    else{
        next();
    }
   
}

module.exports.originalUrl = (req,res,next)=>{
    if(req.session.originalUrl){
        res.locals.originalUrl = req.session.originalUrl;
    }
    next();
}


module.exports.isOwner = async (req,res,next)=>{
    let data = await Listing.findById(req.params.id).populate("owner");

    if(!data.owner._id.equals(req.user._id)){
        req.flash("error","You are not owner of this listing!");
        res.redirect(`/listings/show/${req.params.id}`);
    }
    else{
        next();
    }
}

module.exports.isAuthor = async (req,res,next)=>{
    let review = await Review.findById(req.params.reviewId).populate("author");
    if(!review.author._id.equals(req.user._id)){
        req.flash("error","your are not author of this review!");
        res.redirect(`/listings/show/${req.params.listingId}`);
    }
    else{
        next();
    }
}



