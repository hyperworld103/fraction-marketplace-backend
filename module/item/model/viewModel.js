/*
Project : Cryptotrades
FileName :  viewModel.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define view schema that will store and reterive item view information.
*/

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var uniqueValidator = require('mongoose-unique-validator');
var config = require('./../../../helper/config')
const Schema = mongoose.Schema;

var viewSchema = mongoose.Schema({
    item_id: { type: Schema.Types.ObjectId, ref: 'item' },
    user_id: { type: Schema.Types.ObjectId, ref: 'users' },
    created_date: {
        type: Date,
        default: Date.now
    },
});

viewSchema.plugin(uniqueValidator);
viewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('views', viewSchema,config.db.prefix+'views');