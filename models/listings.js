const mongoose=require("mongoose");
const Review = require("./reviews");
const { type } = require("../schema");

const listingSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/464303942.jpg?k=24e506ebac37b9faee6d31c754f97af1b1362355fc4a28cf7bb4ec72624cfc5d&o=&hp=1",
        set: (v)=> v==="" ? "https://cf.bstatic.com/xdata/images/hotel/max1024x768/464303942.jpg?k=24e506ebac37b9faee6d31c754f97af1b1362355fc4a28cf7bb4ec72624cfc5d&o=&hp=1" : v,
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

});


listingSchema.post("findOneAndDelete",async(data)=>{
    if(data.reviews.length){
        await Review.deleteMany({_id: {$in : data.reviews}});
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;

