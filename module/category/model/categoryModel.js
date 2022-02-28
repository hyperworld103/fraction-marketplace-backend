/*
Project : Cryptotrades
FileName : categoryModel.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define category collection that will communicate and process category information with mongodb through mongoose ODM.
*/

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var uniqueValidator = require('mongoose-unique-validator');
var config = require('./../../../helper/config')

// Setup schema
var categorySchema = mongoose.Schema({
    title: {
        type: String,
        minlength: [3, 'Title must be 3 characters or more'],
        maxlength: [255, "Title can't exceed 255 characters"],
        required: [ true , 'Title is required'], 
    },    
    category_image: {
        type: String,
        required: [ true , 'Image is required'], 
    },
    status:{
        type: String,
        enum : ['active','inactive'],
        default: 'active'
    },
    create_date: {
        type: Date,
        default: Date.now
    },
});

categorySchema.plugin(uniqueValidator);
categorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('category', categorySchema,config.db.prefix+'category');