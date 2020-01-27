const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PexelsAPI = require('pexels-api-wrapper');
const { ensureAuthenticated } = require('../helpers/auth');
let arr = [];

// middleware for body parser
let urlencodedParser = bodyParser.urlencoded({ extended: false });

// load Models
require('../models/product');
const Product = mongoose.model('products');

router.use(ensureAuthenticated);

// list all the products
router.get('/', (req, res) => {
    Product.find({})
        .then((products) => res.render('products/index', {
            products: products,
        }));
});

// Add products Form

router.get('/add', (req, res) => {
    let obj = {
        errors: []
    }
    res.render('products/add', obj);
});

router.post('/', urlencodedParser, async (req, res) => {
    let errors = [];

    if (!req.body.name) {
        errors.push({ text: 'Please add a name' });
    }
    if (!req.body.desc) {
        errors.push({ text: 'Please add some description' });
    }
    if (!req.body.qty) {
        errors.push({ text: 'Please add a quantity' });
    }
    if (!req.body.price) {
        errors.push({ text: 'Please add a price' });
    }

    if (errors.length > 0) {
        res.render('products/add', {
            errors: errors,
            name: req.body.name,
            desc: req.body.desc,
            qty: req.body.qty,
            price: req.body.price,
        });
    } else {
        await getImage(req.body.name);
        const prod = {
            image: arr[0],
            name: req.body.name,
            desc: req.body.desc,
            qty: req.body.qty,
            price: req.body.price,
        }
        arr = [];
        new Product(prod)
            .save()
            .then(prod => {
                res.redirect('/products');
            })
    }
});

// Edit products Form

router.get('/edit/:id', urlencodedParser, (req, res) => {
    const filter = {
        _id: req.params.id,
    };
    Product.findOne(filter, (err, data) => {
        res.render('products/edit', { products: data, errors: [] });
    })
});

// edit form process 
router.put('/:id', urlencodedParser, async (req, res) => {
    const filter = {
        _id: req.params.id,
    };
    await getImage(req.body.name);
    Product.updateOne(
        filter,
        {
            $set: { "image": arr[0], "name": req.body.name, "desc": req.body.desc, "qty": req.body.qty, "price": req.body.price },
        }
    ).then(() => {
        res.redirect('/products');
    })
    arr = [];
});

// delete form process
router.delete('/:id', urlencodedParser, (req, res) => {
    const filter = {
        _id: req.params.id,
    }
    Product.deleteOne(filter)
        .then(() => {
            res.redirect('/products');
        });
});

module.exports = router;

async function getImage(product) {
    let pexelsClient = new PexelsAPI('563492ad6f91700001000001cf0d1ef4e1bc4b248f5f1d899d5e6f760');

    //Search API
    await pexelsClient.search(`${product}`, 1, 1)
        .then(function (result) {
            let str = result.photos[0].src.original;
            setPhoto(str);
        }).
        catch(function (e) {
            console.log('error occured while fetching data');
        });
}

function setPhoto(str) {
    arr.push(str);
}
