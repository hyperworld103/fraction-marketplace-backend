/*
Project : Cryptotrades
FileName : optionsModel.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define setting model to store additional information required in the application.
*/

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var config = require('./../../../helper/config');
const Schema = mongoose.Schema;

// Setup schema
var optionSchema = mongoose.Schema({
    name: { 
        type: String, 
        require:[true, 'Settings name is required'] 
    },
    value: { 
        type: String, 
        default: ''
    },
});

optionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('options', optionSchema,config.db.prefix+'options');