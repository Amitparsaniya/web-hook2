const express =require("express")
const mongoose =require("mongoose")

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        // required:true
    },
    chargeId:{
        type:String
    },
    city:{
        type:String
    },
    otp:{
        type:String
    },
    isVerified:{
        type:Number,
        default:0
    }
},{
    timeStamps:true
})

const User  =  mongoose.model("User",userSchema)

module.exports = {User}