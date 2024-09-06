const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Image = require('./models/image')
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { render } = require('ejs');
//connect to mongodb
require('dotenv').config();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const port = process.env.PORT || '3000'

mongoose.connect(process.env.URI) 
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err))
app.set('view engine','ejs');


//routes
app.get('/',(res,req)=>{
    req.render('home',{title: 'Home'})
    
})
app.get('/Signup',(res,req)=>{
    req.render('signup',{title: 'SignIn/SignUp'})
})
app.get('/Signin',(res,req)=>{
    req.render('signin',{title: 'SignIn/SignUp'})
})
app.get('/upload',(req,res)=>{
    res.render('upload',{title: 'Upload'});
})
app.get('/upload-paint',(req,res)=>{
    res.render('upload-paint',{title: 'Upload-paintings '});
})
// app.get('/paintings',(req,res)=>{
//     res.render('paintings');
// })

app.get('/paintings', (req, res) => {
    Image.find()
        .then((result)=>{
            res.render('paintings',{ title: 'paintings', items: result})
        })
        .catch((err)=>{
            console.log(err)
        })
});

const upload = multer({ storage: storage });

app.post('/paintings', upload.single('image'), (req, res, next) => {

    const obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    
    Image.create(obj)
        .then ((err, item) => {
            item.save()
            res.redirect('/paintings')
        })
        .catch((err)=>{
            console.log(err)
        })
});

app.get('/paintings/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        res.render('details', { image: image,title:'Image details' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.delete('/paintings/:id',(req,res)=>{
    const id = req.params.id

    Image.findByIdAndDelete(id)
        .then(result =>{
            res.json({redirect:'/paintings'} )
        })
        .catch(err=>{
            console.log(err)
        })
})  

// app.get('/paintings/:id',(req,res)=>{
//     const id = req.params.id
//     Image.findById(id)
//         .then((result)=>{
//             res.render('details', { image: result,title: 'Image details'})
//         })
//         .catch((err)=>{
//             console.log(err)
//         })

// })

// app.post('/blogs',(req,res) =>{
//     const blog = new Blog(req.body)

//     blog.save()
//         .then((result)=>{
//             res.redirect('/blogs')
//         })
//         .catch((err) => {
//             console.log(err)
//         })
// })

//blog routes
// app.get('/blogs',(req,res) => {
//     Blog.find()
//         .then((result)=>{
//             res.render('home',{ title: 'All Blogs', blogs:result})
//         })
//         .catch((err)=>{
//             console.log(err)
//         })
// })
