const bcrypt=require('bcrypt')
//this is to encrypt the password provided by the user
const mongoose=require('mongoose')
//we used mongo databse so first we connect to it
// this is the user schema for the registerpage inputs.
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})
//before saving password we will encrypt it
userSchema.pre('save',function(next){
    const user=this
    bcrypt.hash(user.password,10,function(error,encrypted){
        user.password=encrypted
        next()
    })
})
const user=mongoose.model('user',userSchema)
module.exports=user