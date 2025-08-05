import mongoose from "mongoose";
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{  
        type:String,
        required:true,
    },
    company:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
    }],
    vendorId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vendor",
    }],
    paymentHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Payment",
    }],
},{timestamps:true});
const user = mongoose.model("User",userSchema);
export default user;