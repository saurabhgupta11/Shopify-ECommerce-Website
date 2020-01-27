const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
// const { preventMultipleLogin } = require('./helpers/auth');

router.use(session({
    "secret": "2323kfkhsdfksdfsdfl",
    saveUninitialized: true,
    resave: true
}));

// Load User Model
require('../models/User');
const User = mongoose.model('users');

// Load Product Model
require('../models/product');
const Product = mongoose.model('products');

// Load Cart Model
require('../models/cart');
const Cart = mongoose.model('carts');

// middleware for body parser
let urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/',async (req,res) => {
    await Product.find({},(err,data) => {
        let obj = {
            userData: req.session.data,
            products: data,
        };
        res.render('users/user', obj);
    });
});

router.get('/cart/:id',async (req,res) => {
    let filter = {
        userId: req.params.id,
    }
    let adminProducts = await Product.find({});
    Cart.find(filter,(err,products) => {
        let prod = [];
        for(let i=0;i<products.length;i++) {
            for(let j=0;j<adminProducts.length;j++) {
                if(products[i].productId.localeCompare(adminProducts[j]._id) === 0) {
                    prod.push(adminProducts[j].qty);
                }
            }
        }
        let obj = {
            userData: req.session.data,
            products: products,
            prod: prod,
        };
        res.render('users/cart',obj);
    });
});


/*--------------------------------------------------------------------*/
// adding item to cart
router.post('/add',urlencodedParser,async (req,res) => {
    let filter =  {
        userId: req.body.userId,
        productId: req.body.productId,
    };
    let docItem = await Cart.findOne(filter)

    if(docItem == null) {
        const cartItem = new Cart({
            userId: req.body.userId,
            productId: req.body.productId,
            name: req.body.name,
            qty: req.body.qty,
            price: req.body.price,
            image: req.body.image,
        });

        cartItem.save()
            .then(item => {
                console.log("saved");
            })
            .catch(err => {
                console.log(err);
                return;
            });
    }
    else {
        console.log(docItem.qty);
        let updatedQty = Number(docItem.qty);
        updatedQty += Number(req.body.qty);
        Cart.updateOne(filter,
            {
                $set: { "userId": req.body.userId, "productId": req.body.productId, "name": req.body.name, "qty": updatedQty, "price": req.body.price,"image": req.body.image }
            },
        ).catch((err) => {
            console.log("updateOne failed");
        })
    }
    res.redirect('/');
});
// adding item to cart
/*--------------------------------------------------------------------*/


router.get('/register', (req, res) => {
    let obj = {
        errors: [],
        name: "",
        email: "",
        password: "",
        password2: "",
    }
    res.render('users/register',obj);
});

//register form process post
router.post('/register',urlencodedParser,(req,res) => {
    let errors = [];

    if (req.body.password != req.body.password2) {
        errors.push({ text: 'Passwords do not match' });
    }

    if (req.body.password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }

    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        });
    } else {
        User.findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    res.redirect('/users/register');
                } else {
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    });

                    newUser.save()
                        .then(user => {
                            res.redirect('/login');
                        })
                        .catch(err => {
                            console.log(err);
                            return;
                        });
                }
            });
    }
});

router.post('/cart/delete',urlencodedParser,(req,res) => {
    let filter = {
        userId: req.body.userId,
        productId: req.body.productId,
    }
    console.log(filter);
    Cart.deleteOne(filter)
        .then(() => {
            console.log("yes");
            res.redirect(`/cart/${userId}`);
        })
        .catch((err) => {
            if(err){
                res.send(err);
            }
        })
});

router.post('/cart/compute',urlencodedParser,async (req,res) => {
    let isFailed = false;
    let cartProd = await Cart.find({userId: req.body.userId});
    let adminProd = await Product.find({});
    for(let i=0;i<cartProd.length;i++) {
        for(let j=0;j<adminProd.length;j++) {
            if (cartProd[i].productId.localeCompare(adminProd[j]._id) === 0) {
                if (Number(cartProd[i].qty) > Number(adminProd[j].qty)) {
                    isFailed = true;
                    res.send({ err: 'One or more products may be out of stock' });
                }
            }
        }
    }
    if(isFailed == false) {
        for (let i = 0; i < cartProd.length; i++) {
            for (let j = 0; j < adminProd.length; j++) {
                if (cartProd[i].productId.localeCompare(adminProd[j]._id) === 0) {
                    if (Number(cartProd[i].qty) <= Number(adminProd[j].qty)) {
                        let updatedQty = Number(adminProd[j].qty) - Number(cartProd[i].qty);
                        Product.updateOne({ _id: cartProd[i].productId },
                            {
                                $set: { "image": adminProd[j].image, "name": adminProd[j].name, "desc": adminProd[j].desc, "qty": updatedQty, "price": adminProd[j].price, }
                            },
                        ).catch((err) => {
                            console.log("updateOne failed");
                        })
                    }
                }
            }
        }
        await Cart.deleteMany({userId: req.body.userId});
        res.send({ err: null });
    }
});

router.get('/checkout',(req,res) => {
    res.send(`Thanks for the purchase`);
});

module.exports = router;