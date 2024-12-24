const express=require("express");
const app=express();
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// app.use(cookieParser("mangesh"));

const session = require("express-session");

const path=require("path");
app.set('view engine','ejs');
app.set("views",path.join(__dirname,"/views"));

app.use(session({
    secret: "mysuperSecretCode",
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());



// app.get("/reqCount",(req,res)=>{
//     if(req.session.count == undefined){
//         req.session.count=0;
//     }
    
//     req.session.count++;
//     // console.log(req.session.count);
//     res.send(`${req.session.count}`);
    
// })

app.get("/register",(req,res)=>{
    let {name="Anonymous"} = req.query;

    req.session.name = name;
    
    if(name === "Anonymous"){
        req.flash("error","user not registered!");
    }
    else{
        req.flash("success","user registered successfully!");
    }
    
    res.redirect("/hello");
})

app.get("/hello",(req,res)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.render("page.ejs",{name: req.session.name});
})

app.get("/test",(req,res)=>{
    res.send(`${req.session.count}`);
    // res.send("test successful");
})











const port=3000;
app.listen(port,()=>{
    console.log(`server is running on port ${port}.`);
});