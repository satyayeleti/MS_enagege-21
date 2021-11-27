require('dotenv').config();
const path=require('path')
const {config,engine}=require('express-edge')
const express= require('express')
const edge=require('edge.js')
const cloudinary=require('cloudinary')
const mongoose=require('mongoose')
const bodyParser=require('body-parser')
const fileUpload=require('express-fileupload')
const post=require('./database/models/post')
const user=require('./database/models/user')
const { dirname } = require('path')
const bcrypt=require('bcrypt')
const expressSession=require('express-session')
const MongoStore=require('connect-mongo')
const connectFlash=require('connect-flash')
const auth=require('./middleware/auth')
const app= new express()
mongoose.connect(process.env.DB_URI)
app.use(connectFlash());
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
    
})
// const mongoStore= connectMongo(expressSession);
app.use(expressSession({
    secret:process.env.EXPRESS_SESSION_KEY,
    store:MongoStore.create({
        client:mongoose.connection.getClient(),
        collectionName:'sessions'
    })
}))

app.use(fileUpload())
app.use(engine)
app.use(express.static('public'))
app.set('views',`${__dirname}/views`)
app.use('*',(req,res,next)=>{
    app.locals.auth=req.session.userId
    next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/',async(req,res)=>{
    const users=await user.find({})
        return res.render('classroom',{
            users,  
        })
    res.render('classroom')
})
app.get('/showfiles',async(req,res)=>{
    if(req.session.userId){
        const posts=await post.find({}).populate('author')
        return res.render('showfilesfiltered',{
            posts
        })
    }
    res.redirect('/login')
    //console.log(req.session)
})
app.get('/create/new',(req,res)=>{
    if(req.session.userId){
        return res.render('create');
    }
    res.redirect('/login')
})
app.get('/viewclass',(req,res)=>{
    res.render('viewclass')
})
app.get('/register',(req,res)=>{
    res.render('register',{
        errors:req.flash('registrationerrors'),
        data:req.flash('data')[0]
        // errors:req.session.registrationerrors
    })
})
app.get('/login',(req,res)=>{
    res.render('login',{
        errors:req.flash('registrationerrors'),
        data:req.flash('data')[0]
        // errors:req.session.registrationerrors
    })
})
app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.post('/create/store',(req,res)=>{
    const{filepdf}=req.files
    const uploadpath=path.resolve(__dirname,'public/posts',filepdf.name);
    filepdf.mv(uploadpath,(error)=>{
        cloudinary.v2.uploader.upload(uploadpath,(error,result)=>{
            if(error){
                return res.redirect('/')
            }
            post.create({
                ...req.body,
                filepdf:result.secure_url,
                //filepdf:`/posts/${filepdf.name}`,
                author:req.session.userId
            },(error,post)=>{
                console.log(post);
                res.redirect('/showfiles'); 
            });
        })
        
    })
    //  console.log(req.files)
});
app.post('/user/register',(req,res)=>{
    user.create(req.body,(error,user)=>{
        if(error){
            const registrationerrors=Object.keys(error,errors).map(key=>error.errors[key].message)
            req.flash('registrationerrors',registrationerrors)
            req.flash('data',req.body)
            // req.session.registrationerrors=registrationerrors
            return res.redirect('/register')
        }
        res.redirect('/login')
    })
})
app.post('/users/login',(req,res)=>{
    const {email,password}=req.body;
    user.findOne({email},(error,user)=>{
        if(error){
            const registrationerrors=Object.keys(error,errors).map(key=>error.errors[key].message)
            req.flash('registrationerrors',registrationerrors)
            req.flash('data',req.body)
            // req.session.registrationerrors=registrationerrors
            return res.redirect('/register')
        }
        else if(user){
            bcrypt.compare(password,user.password,(error,same)=>{
                if(same){
                    //store user session
                    req.session.userId=user._id
                    return res.redirect('/showfiles')
                }else{
                    return res.redirect('/login')
                }
            })
        }else{
            return res.redirect('/register')
        }
    })
})

app.use((req,res)=>{
    res.render('notfound')
})

app.listen(process.env.PORT,()=>{
    console.log('app listening on port 4000')
})