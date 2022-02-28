/*
Project : Cryptotrades
FileName : categoryController.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all category related api function.
*/

var categories = require('./../model/categoryModel');
var validator = require('validator');
const { validationResult } = require('express-validator');

/*
*  This is the function which used to retreive active category list
*/
exports.getList = async function(req,res) {
    var page = req.query.page ? req.query.page : '1';  
    var query = categories.find();
    var offset = ( page == '1' ) ? 0 : ((parseInt(page-1))*10);
    query = query.where('status' , 'active')    
    query = query.sort('-create_date')
    query.exec(function(err,result){
        res.json({
            status: true,
            message: "Category retrieved successfully",
            data: result
        });
    })
}


/*
*  This is the function which used to retreive category detail by category id
*/
exports.details = function(req,res) {
    console.log("received params are ", req.params)
    categories.findOne({_id:req.query.category_id}).exec( function (err, category) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"Category not found"
            });
            return;
        }
        if(!category) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"Category not found"
            });
            return;
        } 
        res.json({
            status: true,
            message: "Category info retrieved successfully",
            result: category
        });
    })
}

/**
 * This is the function which used to list all categories
 */
exports.getAdminList  = function(req,res) {
    var page = req.query.page ? req.query.page : '1';  
    var query = categories.find();
    var offset = ( page == '1' ) ? 0 : ((parseInt(page-1))*10); 
    query = query.sort('-create_date')
    var options = {
    select:   'title category_image status create_date',
    page:page,
    offset:offset,
    limit:15,    
    };  
    categories.paginate(query, options).then(function (result) {
        res.json({
            status: true,
            message: "Category retrieved successfully",
            data: result
        });
    }); 
}

/**
 * This is the function which used to add category from admin
 */
exports.add  = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    var category = new categories();
    category.title = req.body.title;
    category.category_image = req.body.category_image;
    category.status = req.body.status;
    category.save(function (err , categoryObj) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        res.json({
            status: true,
            message: "Category created successfully",
            result: categoryObj
        });
    });
}
/**
 *  This is the function which used to update category 
 */
exports.edit  = function(req,res) {
    categories.findOne({_id:req.body.category_id}, function (err, category) {
        if (err || !category) {
            res.json({
                status: false,
                message: "Category not found",
                errors:err
            });
            return;
        } else {
            category.title = req.body.title ?  req.body.title : category.title;
            category.category_image = req.body.category_image ?  req.body.category_image : category.category_image;
            category.status = req.body.status;
            category.save(function (err , category) {
                if (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors:err
                    });
                    return;
                } else {
                    res.json({
                        status: true,
                        message: "Category updated successfully",
                        result: category 
                    });  
                }
            });
        }
    });
}

/**
 *  This is the function which used to delete category 
 */
 exports.delete  = function(req,res) {
    categories.findOne({_id:req.body.category_id}, function (err, category) {
        if (err || !category) {
            res.json({
                status: false,
                message: "Category not found",
                errors:err
            });
            return;
        } else {
            categories.deleteOne({_id:req.body.category_id},function(err) {
                res.json({
                    status: true,
                    message: "Category deleted successfully"
                }); 
            })
        }
    });
 }










