const express = require('express');
const app = express();
const session = require('express-session');

app.use(session({
    "secret": "2323kfkhsdfksdfsdfl",
    saveUninitialized: true,
    resave: true
}));

module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.session.isAdmin) {
            return next();
        }
        res.redirect('/login');
    },
    preventMultipleLogin: function (req, res, next) {
        if(req.session.isUser) {
            res.redirect('/users');
        } else {
            next();
        }
    }
}