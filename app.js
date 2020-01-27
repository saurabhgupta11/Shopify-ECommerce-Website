const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const Schema = mongoose.Schema;
const {ensureAuthenticated} = require('./helpers/auth');
const { preventMultipleLogin } = require('./helpers/auth');
let arr = [];

// load routes
const products = require('./routes/products');
const users = require('./routes/users');

// Schema
const AdminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

const Admin = mongoose.model('admins', AdminSchema);

require('./models/User');
const User = mongoose.model('users');


// middleware for body parser
let urlencodedParser = bodyParser.urlencoded({ extended: false });

// methodOverride middleWare
app.use(methodOverride('_method'));

// express-session middleware
app.use(session({
    "secret": "2323kfkhsdfksdfsdfl",
    saveUninitialized: true,
    resave: true
}));


// mongoose
mongoose.connect('mongodb://localhost/shopify_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));


// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// setting view engine
app.set(path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// routes
app.get('/',preventMultipleLogin,(req,res) => {
    req.session.isAdmin = false;
    req.session.isUser = false;
    res.render('home');
});

app.get('/about',preventMultipleLogin,(req,res) => {
    req.session.isAdmin = false;
    req.session.isUser = false;
    res.render('about');
});


app.get('/admin',ensureAuthenticated,(req,res) => {
    res.render('admin');
});


app.get('/login',preventMultipleLogin,(req,res) => {
    res.render('login',{errors: []});
});

app.get('/logout',(req,res) => {
    req.session.isAdmin = false;
    req.session.isUser = false;
    res.redirect('/');
});

app.post('/login',urlencodedParser,(req,res) => {
    Admin.findOne({email: req.body.email,password: req.body.password},(err,data) => {
        if(data != null) {
            req.session.isAdmin = true;
            res.redirect('/products');
        } else {
            User.findOne({ email: req.body.email, password: req.body.password }, (err, data) => {
                if (data != null) {
                    req.session.data = data;
                    req.session.isUser = true;
                    res.redirect('/users');
                } else {
                    res.render('login',{errors: ["Email/Password is incorrect"]});
                }
            });
        }
    });
});


app.use('/products',products);
app.use('/users',users);


// server and environment and port stuff
const port = 3000;

app.listen(port,() => {
    console.log(`listening on port ${port}`);
});