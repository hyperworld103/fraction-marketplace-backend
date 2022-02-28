/*
Project : Cryptotrades
FileName : settingsController.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all user related api function.
*/

var options = require('./../model/optionsModel')
var mongoose = require('mongoose');
var users = require('./../../user/model/userModel')
const { validationResult } = require('express-validator');
var cp = require('child_process');
/*
*  This is the function which used to install required data in mongodb collection
*/
exports.installOptions = function(req,res) {
  
    // create admin user
    var user = new users();
    user.username = "admin";
    user.email = "admin@mail.com";
    user.password = '123456';
    user.first_name = "admin";
    user.last_name = "user";
    user.phone = "1234567890";
    user.profile_image = "";
    user.role = 1
    user.status = 'active'
    var command = 'sh address.sh';
    cp.exec(command, function(err, stdout, stderr) {
        console.log('stderr ',stderr)
        console.log('stdout ',stdout)
        // handle err, stdout, stderr
        if(err) {
            console.log("error is ",err)
            res.json({
                status: false,
                message: err.toString().split('ERROR: ').pop().replace(/\n|\r/g, "")
            });
            return
        }
        var private_key = stdout.toString().split('Private key: ').pop().replace(/\n|\r/g, " ").split(' ')
        var public_key = stdout.toString().split('Public address: ').pop().replace(/\n|\r/g, " ").split(' ')
        console.log('private key',private_key)
        console.log('public key',public_key)
        user.private_key = private_key[0];
        user.public_key = public_key[0];
        user.save();
    });

    var option = new options();
    option.name = "admin_commission";
    option.value = 2;
    option.save();
    

    res.json({
        status: true,
        message:"Installation cmpleted successful",
    });


}

/*
*  This is the function which used to set option value for admin settings
*/
exports.setOptions = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    } 
    options.findOne({name:req.body.name}, function (err, option) {
        if (option) {
            option.value = req.body.value;
            option.save(function(err,option) {
                res.json({
                    status: true,
                    message:"Options saved successfully",
                });
            })
        } else {
           var optionadd = new options();
           optionadd.name = req.body.name;
           optionadd.value = req.body.value;
           optionadd.save(function(err,optionobj) {
               res.json({
                   status: true,
                   message:"Options saved successfully",
               });
           })
        }

    })
}


/*
*  This is the function which used to get option value for admin settings
*/
exports.getOptions = function(req,res) {
    options.findOne({name:req.query.name}, function (err, option) {
        if (err || !option) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }

        res.json({
            status: true,
            message:"Options detail reterived successfully successfully",
            result : option
        });
        
    })
}