/*
Project : Cryptotrades
FileName : userModel.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define user collection that will communicate and process user information with mongodb through mongoose ODM.
*/

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var bcrypt = require('bcrypt');
var validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
var config = require('../../../helper/config')



// Setup schema
var adminSchema = mongoose.Schema({
    email: {
        type: String,
        unique: [ true , 'Email already exists. Please try a different email address'],
        validate: [ validator.isEmail, 'Oops, please enter a valid email address' ]
    },
    password: {
        type: String,
    }, 
    private_key:{
        type: String,
    },
    public_key:{
        type: String,
    },  
    phone: {
        type: String,
    },
    paypal: {
        type: String,
    }
});

adminSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();

    if (user.password.length==0) return next();
    // generate a salt
    bcrypt.genSalt(12, function(err, salt) {
        if (err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
    
});

adminSchema.methods.comparePassword = function(candidatePassword, cb) {
bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

adminSchema.plugin(uniqueValidator);
adminSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('admins', adminSchema,config.db.prefix+'admins');