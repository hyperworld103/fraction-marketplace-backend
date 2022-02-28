/*
Project : Cryptotrades
FileName :  priceModel.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define view schema that will store and reterive item price information.
*/

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var uniqueValidator = require('mongoose-unique-validator');
var config = require('./../../../helper/config')
const Schema = mongoose.Schema;

var priceSchema = mongoose.Schema({
    item_id: { type: Schema.Types.ObjectId, ref: 'item' },
    price: {
        type: Number,
        default:0
    },
    user_id: {
        type: Schema.Types.ObjectId, ref: 'users'
    },
    created_date: {
        type: Date,
        default: Date.now
    },
});

priceSchema.plugin(uniqueValidator);
priceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('prices', priceSchema,config.db.prefix+'prices');