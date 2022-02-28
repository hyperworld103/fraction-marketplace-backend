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
var config = require('./../../../helper/config')



// Setup schema
var userSchema = mongoose.Schema({
    username: {
        type: String,
        minlength: [1, 'User Name must be 1 characters or more'],
        maxlength: [32, "User Name can't exceed 32 characters"],
        validate:[validator.isAlpha ,'UserName  must be alphabetic'],
    },
    email: {
        type: String,
        unique: [ true , 'Email already exists. Please try a different email address'],
        validate: [ validator.isEmail, 'Oops, please enter a valid email address' ]
    },
    password: {
        type: String,
    },
    first_name: {
        type: String,
        minlength: [1, 'First Name must be 1 characters or more'],
        maxlength: [32, "First Name can't exceed 32 characters"],
        validate:[validator.isAlpha ,'First Name must be alphabetic'],
        required: [ true , 'First Name is required'], 
    },
    last_name: {
        type: String,
        minlength: [1, 'Last Name must be 1 characters or more'],
        maxlength: [32, "Last name can't exceed 32 characters"],
        validate:[validator.isAlpha ,'Last Name must be alphabetic'],
        required: [ true , 'Last Name is required'], 
    }, 
    private_key:{
        type: String,
    },
    public_key:{
        type: String,
    },   
    dob:String,   
    phone: {
        type: String,
    },
    profile_image: String,    
    profile_cover: String,            
    facebook_info: {
        type: Map,
        of: String
    },
    twitter_info: {
        type: Map,
        of: String
    },
    google_info: {
        type: Map,
        of: String
    },
    role: {type:Number, default:2},
    is_notification: {type:Number, default:1},
    is_featured: {type:Number, default:0},
    status:{
        type: String,
        enum : ['active','inactive','blocked','reset']
    },
    device_info:{
        type: Map,
        of: String
    },
    create_date: {
        type: Date,
        default: Date.now
    },
    activation_code: {
        type: String,
    },
    opt_code: {
        type: String,
    },
    paypal: {
        type: String,
    }
});

userSchema.pre('save', function(next) {
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

userSchema.methods.comparePassword = function(candidatePassword, cb) {
bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('users', userSchema,config.db.prefix+'users');