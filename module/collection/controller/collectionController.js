/*
Project : Cryptotrades
FileName : collectionController.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all collection related api function.
*/

var collections = require('../model/collectionModel');
var users = require('../../user/model/userModel');

const { validationResult } = require('express-validator');
const config = require('../../../helper/config');
var fs = require('fs')
const { createCollection } = require('./../infura/collectionInfura');
/*
* This is the function which used to add collection in database
*/
exports.add = async function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    
    let symbol = req.body.name.replace(" ", "_")
    let collection_address = 'test';
    await users.findOne({_id:req.decoded.user_id}, function (err, user) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(user)) {
            res.json({
                status: false,
                message: "User not found",
            });
            return;
        } 
        // collection_address = await createCollection(user.public_key, user.private_key, req.body.name, symbol);
    });

    let collection = new collections();
    collection.name = req.body.name;
    collection.description = req.body.description ? req.body.description : '';
    collection.royalties = req.body.royalties ? req.body.royalties : 0;
    collection.banner = req.body.banner ? req.body.banner : '';
    collection.image = req.body.image ? req.body.image : '';
    collection.status = 1;
    collection.author_id = req.decoded.user_id;
    collection.contract_symbol = symbol;
    collection.contract_address = collection_address;

    collection.save(function (err) {
        if (err) {
            let w_err = 'Request Failed'            
            if(err.keyValue) {
                if(err.keyValue.name){
                    w_err = "Collection already Exist"
                }
            }
            res.json({
                status: false,
                message: w_err,
                errors:err
            });
            return;
        }
        res.json({
            status: true,
            message: "Collection created successfully"
        });                        
    });

}

/*
* This is the function which used to update collection in database
*/
exports.update = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    collections.findOne({contract_address:req.body.contract_address, author_id: req.decoded.user_id}, function (err, collection) {
        if (err || !collection) {
            res.json({
                status: false,
                message: "Collection not found",
                errors:err
            });
            return;
        } else {
            collection.name = req.body.name ?  req.body.name : collection.name;
            collection.image = req.body.image ?  req.body.image : collection.image;
            collection.banner = req.body.banner ? req.body.banner : collection.banner;
            collection.royalties = req.body.royalties ? req.body.royalties : collection.royalties;
            collection.description = req.body.description ? req.body.description : collection.description;

            collections.updateMany({_id: req.body.collection_id}, {'$set': {
                'name': collection.name,
                'description': collection.description,
                'royalties': collection.royalties,
                'image': collection.image,
                'banner': collection.banner
            }}, function(err) {
                if (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors:err
                    });
                    return
                }    
                res.json({
                    status: true,
                    message: "Collection updated successfully",
                });
            });
        }
    });
}

/*
* This is the function which used to delete collection in database
*/
exports.delete = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    collections.findOne({_id:req.body.collection_id}, function (err, collection) {
        if (err || !collection) {
            res.json({
                status: false,
                message: "Collection not found",
                errors:err
            });
            return;
        } 
        if(collection.item_count > 0){
            res.json({
                status: false,
                message: "Collection has items and you can't delete it"
            }); 
        } else {
            collections.deleteOne({_id:req.body.collection_id},function(err) {
                res.json({
                    status: true,
                    message: "Collection deleted successfully"
                }); 
            })
        }
    });
}

/**
 *  This is the function which used to view collection
 */
exports.view = function(req,res) {
    collections.findOne({contract_address:req.body.contract_address}).exec( function (err, collection) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"Collection not found"
            });
            return;
        }
        if(!collection) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"Collection not found"
            });
            return;
        } 
        res.json({
            status: true,
            message: "Collection info retrieved successfully",
            result: collection
        });
    })
}

/**
 * This is the function which used to list collection with filters
 */
exports.list = function(req,res) {
    // var keyword = req.query.keyword ? req.query.keyword : ''; 
    // keyword = keyword.replace("+"," ");     
    // var page = req.query.page ? req.query.page : '1';  
    // var query  = collections.find();
    // var offset = ( page == '1' ) ? 0 : ((parseInt(page-1))*10);
    var keyword = req.body.searchName ? req.body.searchName : '';
    var limit = req.body.paginationLimit ? parseInt(req.body.paginationLimit) : 10;
    var offset = req.body.offset ? parseInt(req.body.offset) : 0;
    var type = req.body.type;
    var query = collections.find();

    if ( keyword != '' ) {
        search = { $or: [ { 
            name :   {
                $regex: new RegExp(keyword, "ig")
        }  } , {
            description : {
                $regex : new RegExp ( keyword , "ig")
            }
        }] }
       query = query.or(search)
    }    
    if(type == "my") {
        if(req.decoded.user_id != null) {
            query = query.where('author_id',req.decoded.user_id).sort('-create_date');
        }
    } else if(req.query.type == "item") {
        if(req.decoded.user_id != null) {
            query = query.sort('-item_count');
        }
    } else {
        query = query.where('status' , 1).sort('-create_date')
    }

    var options = {
        select:   'name',// 'description', 'banner', 'image', 'royalties', 'item_count'],
        skip: offset,
        limit: limit    
    };  

    var fields = ['name', 'description', 'banner', 'image', 'royalties', 'item_count', 'contract_address']
    collections.find(query, fields, {skip: offset, limit: limit}).then(function (result) {
        res.json({
            status: true,
            message: "Collection retrieved successfully",
            data: result
        });
    }); 
}

/**
 * This is the function which used to list all items for admin
 */
exports.getAdminCollectionList = function(req,res) {
    var keyword = req.body.searchName ? req.body.searchName : '';
    var limit = req.body.paginationLimit ? parseInt(req.body.paginationLimit) : 20;
    var offset = req.body.offset ? parseInt(req.body.offset) : 0;
    var query = collections.find();

    if ( keyword != '' ) {
        search = { $or: [ { 
            name :   {
                $regex: new RegExp(keyword, "ig")
        }  } , {
            description : {
                $regex : new RegExp ( keyword , "ig")
            }
        }] }
       query = query.or(search)
    }    
    query = query.where('status' , 1).sort('-create_date');
    var fields = ['name', 'description', 'banner', 'image', 'royalties', 'status', 'create_date']
    collections.find(query, fields, {skip: offset, limit: limit}).then(function (result) {
        res.json({
            status: true,
            message: "Collection retrieved successfully",
            data: result
        });
    }); 
}



