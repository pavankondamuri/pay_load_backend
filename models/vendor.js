import mongoose from "mongoose";
const vendorSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    accountHolderName:{
        type:String,
        required:true,
    },
    accountNumber:{
        type:Number,
        required:true,
        unique:true,
    },
    ifscCode:{
        type:String,
        unique:true,
    },
    phoneNumber:{
        type:Number,
        required:true,
    },
    vechicleNumber:{
        type:[String],
        required:true,

    },
    paymentHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Payment",
    }],
},{timestamps:true});

const Vendor=mongoose.model("Vendor",vendorSchema);
export default Vendor;