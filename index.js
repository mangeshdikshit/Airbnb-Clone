const express=require("express");
const app=express();


const mongoose=require("mongoose");
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main()
.then((result)=>{
    console.log(`database connected!`);
})
.catch((err)=>{
    console.log(err);
});


const path=require("path");
app.set('view engine','ejs');
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"/public")));


app.use(express.urlencoded({extended:true}));

const methodOverride=require("method-override");
app.use(methodOverride('__method'));

const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);


const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/users");


const Listing = require("./models/listings");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const schemaValidation = require("./schema");
const reviewSchema = require("./review");

const session = require("express-session");
const flash = require("connect-flash");
const sessionOptions={
    secret: "mySecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const {isLoggedin, originalUrl, isOwner, isAuthor} = require("./middleware");

const Review = require("./models/reviews");


const listingValidation = (req,res,next) =>{
    let result = schemaValidation.validate(req.body);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    else{
        next();
    }
}

const reviewValidation = (req,res,next) =>{
    let result = reviewSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    else{
        next();
    }
}

app.use((req,res,next)=>{
    res.locals.msg = req.flash("success");
    res.locals.msgerror = req.flash("error");
    res.locals.user= req.user;
    next();
})






app.get("/signup", wrapAsync(async(req,res)=>{
    res.render("./users/signup.ejs");
}))

app.post("/signup", wrapAsync(async(req,res)=>{
   try{
    let user = {
        username : req.body.username,
        email: req.body.email,
    }
    
    let registeredUser = await User.register(user,req.body.password);
    req.login(registeredUser,(err)=>{
        if(err){
            next(err);
        }
        req.flash("success","user registered successfully!");
        res.redirect("/listings");
    })
    
   } catch(e){
    let {message} = e;
    req.flash("error",message);
    res.redirect("/signup");
   }
}))


app.get("/login",wrapAsync(async(req,res)=>{
    res.render("./users/login.ejs");
}))

app.post("/login",originalUrl,passport.authenticate("local",{failureRedirect: "/login",failureFlash: true}),wrapAsync(async(req,res)=>{
    req.flash("success","user logged in successfully!");
    let redirectUrl = res.locals.originalUrl || "/listings";
    res.redirect(redirectUrl);
}))

app.get("/logout",wrapAsync(async(req,res,next)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }

        req.flash("success","logged out successfully!");
        res.redirect("/listings");
    })
}))


app.get("/listings",wrapAsync(async (req,res)=>{
    let data = await Listing.find({});
    // console.log(data);
    res.render("./listings/index.ejs",{ data })
}));

app.get("/listings/show/:id",wrapAsync(async (req,res)=>{
    let data = await Listing.findById(req.params.id).populate({path: "reviews", populate:{path: "author"}}).populate("owner");
    
    // console.log(data);
    res.render("./listings/show.ejs",data);
    
}));

app.post("/listings/show/:id",isLoggedin,reviewValidation, wrapAsync(async (req,res)=>{
    let data=req.body;
    data.author = req.user._id;
    const review1 = new Review(data);

    await review1.save();
    let listing= await Listing.findById(req.params.id);
    listing.reviews.push(review1);
    await listing.save();
    // console.log(await listing.populate("reviews"));
    req.flash("success","Review Posted Successfully!");
    res.redirect(`/listings/show/${req.params.id}`);
}));

app.delete("/listings/:listingId/show/:reviewId",isLoggedin,isAuthor,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.listingId).populate("reviews");
    let review = await Review.findById(req.params.reviewId).populate("author");

    await Review.findByIdAndDelete(req.params.reviewId);
    await Listing.findByIdAndUpdate(req.params.listingId , {$pull : {reviews: req.params.reviewId}});
    // console.log(listing);
    // console.log(review);

    req.flash("success","Review Deleted Successfully!")
    res.redirect(`/listings/show/${req.params.listingId}`);
    
}))


app.get("/listings/new",isLoggedin,wrapAsync(async (req,res)=>{
    res.render("./listings/new.ejs");
    
}));

app.post("/listings/new",isLoggedin,listingValidation,wrapAsync(async (req,res)=>{
    let data = req.body;
    data.owner = req.user._id;
    const listing1 = new Listing(data);

    await listing1.save();
    req.flash("success","New Listing is Created, Successfully!");
    res.redirect("/listings");
}));

app.get("/listings/:id/edit",isLoggedin,isOwner,wrapAsync(async (req,res)=>{

    let data = await Listing.findById(req.params.id).populate("owner");

    
        res.render("./listings/edit.ejs",data);
    
    // console.log(data);
    
}));

app.patch("/listings/:id/edit",isLoggedin,isOwner,listingValidation, wrapAsync(async (req,res)=>{
    let data= req.body;
    // console.log(data);
    await Listing.updateOne({_id: req.params.id},data);
    req.flash("success","Listing Edited Successfully!");
    res.redirect(`/listings/show/${req.params.id}`);
}));

app.delete("/listings/:id/delete",isLoggedin,isOwner,wrapAsync(async (req,res)=>{
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings");
}));

















app.all("*",(req,res,next)=>{
    throw new ExpressError(404,"Page Not Found!");
});

app.use((err,req,res,next)=>{
    let {status=500,message="Internel Error!"}=err;
    res.render("./listings/error.ejs",{status,message});
});

const port=3000;
app.listen(port,()=>{
    console.log(`server is running on port ${port}.`);
});
