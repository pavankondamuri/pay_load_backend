import mongoose from "mongoose";

const companySchema=new mongoose.Schema({
    companyName:{
        type:String,
        required:true,
    },
    ownerName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
    },
    phoneNumber:{
        type:Number,

    
    },
    description:{
        type:String,
        default:"",
    },
    paymentHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Payment",
    }],
 
},{timestamps:true});

const Company=mongoose.model("Company",companySchema);
export default Company;