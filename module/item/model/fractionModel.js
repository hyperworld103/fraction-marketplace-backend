/*
Project : Cryptotrades
FileName : fractionModel.js
Author : LinkWell
File Created : 21/11/2021
CopyRights : LinkWell
Purpose : This is the file which used to define collection schema that will communicate and process collection information with mongodb through mongoose ODM.
*/

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var uniqueValidator = require('mongoose-unique-validator');
var config = require('./../../../helper/config')
const Schema = mongoose.Schema;
// Setup schema

var fractionSchema = mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    symbol: {
        type: String,
        default:''
    },
    decimals: {
        type: Number,
        default:16
    },
    fractionCount: {
        type: Number,
        default:0
    },
    fractionPrice:{
        type: Number,
        default:0
    },
    fractionAddress: { 
        type: String,
        default: '' 
    },
    paymentToken: {
        type: String,
        default: ''
    },
    fee: {
        type: Number,
        default: 0
    },
    days: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default: 'set_price'
    },
    item_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'item' 
    },
    collection_id: {
        type: Schema.Types.ObjectId,
        ref: 'collection'
    },
    chainId: {
        type: Number,
        default: 1
    },
    create_date: {
        type: Date,
        default: Date.now
    },
});

fractionSchema.plugin(uniqueValidator);
fractionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('fraction', fractionSchema,config.db.prefix+'fraction');