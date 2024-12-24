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

const Listing = require("../models/listings");
const data = require("./data");

data.sampleListings.map((obj)=>{
    obj.owner = "675c248209b71846cea44a5f"
})

console.log(data.sampleListings);

// Listing.deleteMany({}).then().catch();

Listing.insertMany(data.sampleListings)
.then((res)=>{
    console.log(res);
})
.catch((err)=>{
    console.log(err);
})