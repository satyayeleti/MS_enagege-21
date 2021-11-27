const mongoose=require('mongoose')
//we used mongo databse so first we connect to it
// this is the post schema the input for the create form schema.
const postSchema = new mongoose.Schema({
    title: String,
    tag:String,
    description: String,
    filepdf: String,
    date:{
        type:Date,
        default: new Date()
    }, 
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    }  
})
const post=mongoose.model('post',postSchema)
module.exports=post