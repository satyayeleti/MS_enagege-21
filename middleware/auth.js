const user=require('../database/models/user')
//it will check if the cokkie has session details or not
module.exports=(req,res,next)=>{
    if(req.session.userId){
        return res.redirect('/')
    }
    next()
}