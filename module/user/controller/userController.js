/*
Project : Cryptotrades
FileName : userController.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all user related api function.
*/

var users = require('./../model/userModel')
var jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt');
var validator = require('validator');
var config = require('./../../../helper/config')
var moment = require('moment');
var mailer = require('./../../common/controller/mailController'); 
const crypto = require('crypto');
const { random, add } = require('lodash');
const { createAccount, getBalances, getErc20Balances } = require('./../infura/userInfura');


//-----------------------------------------------adminpanel part-------------------------------------------------

/*
*   This is the function which used to retreive user list for admin
*/
exports.getlist = function(req,res) {
    var keyword = req.body.searchName ? req.body.searchName : '';
    var limit = req.body.paginationLimit ? parseInt(req.body.paginationLimit) : 20;
    var offset = req.body.offset ? parseInt(req.body.offset) : 0;
    var query = users.find();

    if ( keyword != '' ) {
        search = { $or: [ { 
            username :   {
                $regex: new RegExp(keyword, "ig")
        }  } , {
            first_name : {
                $regex : new RegExp ( keyword , "ig")
        }   } , {
            last_name : {
                $regex : new RegExp ( keyword , "ig")
        }   } , {
            email : {
                $regex : new RegExp ( keyword , "ig")
            }           
        }] }
       query = query.or(search)
    }    
    query = query.where('role' , 2).sort('-create_date');
    var fields = ['username', 'first_name', 'last_name', 'profile_image', 'email', 'status', 'create_date']
    users.find(query, fields, {skip: offset, limit: limit}).then(function (result) {
        res.json({
            status: true,
            message: "User retrieved successfully",
            data: result
        });
    }); 
}

/*
*   This is the function which used to update user status from admin
*/
exports.updateStatus = function(req,res) {
    let msg = 'actived';
    let params ={
        'status': 'active'
    };    
    
    if(req.body.status && (req.body.status == 'active' || req.body.status == 'reset')){
        params ={
            'status': 'inactive'
        };
        msg = 'inactived'
    }    
    
    users.updateMany({_id: req.body.user_id}, {'$set': params}, function(err) {
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
            message:"User has been " + msg,
        });
        return;
    });
}

//---------------------------------------------frontend part-----------------------------------------------------

/*
*  This is the function which used to create new user in Cryptotrades
*/
exports.register = function(req,res) {
    this.checkUserNameExist(req,res,function(result) {
        if(result) {
           this.checkEmailExist(req,res,function(result){
              this.registerUser(req,res);
           });
        }
    })
}

/**
 * This is the function which used to login user
 */
exports.login = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  

    if(validator.isEmail(req.body.username)) {
        params = {email:req.body.username};
    } else {
        params = {username:req.body.username};
    } 
    this.loginUser(params,req,res);
}

/**
 * This is the function which used to login user
 */
exports.optVerify = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  

    params = {activation_code:req.body.activation_code, opt_code: req.body.opt_code};
    this.checkOpt(params,req,res);
}

/*
*  This is the function which used to find user password if user forgot password
*/
exports.forgot = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }
    let params =  {email:req.body.email}
    users.findOne(params, function (err, user) {
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
                message:"User not found"
            });
            return;
        }  
        if(user.status == "inactive") {
            res.json({
                status: false,
                message:"Your account has been inactive. Contact admin to activate your account"
            });
            return;
        }
        if(user.status == "blocked") {
            res.json({
                status: false,
                message:"Your account has been blocked. Contact admin to unblock your account"
            });
            return;
        }

        let newpassword = randomstring.generate({
            length: 6,
            charset: 'alphabetic'
          });  

        user.password = newpassword;
        bcrypt.genSalt(12, function(err, salt) {
            if (err) return;
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return;
                // override the cleartext password with the hashed one
                user.password = hash;
                
                users.updateMany({_id: user._id}, {'$set': {
                    'password': user.password,
                    'status': 'reset'
                }}, function(err) {
                    if (err) {
                        res.json({
                            status: false,
                            message: "Request failed",
                            errors:err
                        });
                        return
                    }    
                    mailer.mail({
                        username : user.first_name + ' ' + user.last_name,
                        content:"Your new password is "+ newpassword
                    },user.email,'Password Reset',config.site_email,function(error,result) {
                        if(error) {
                            console.log("email not working");
                        }           
                        console.log("new password is ", newpassword)
                        res.json({
                            status: true,
                            message: "Email sent. Please refer your email for new password"
                        });
                        return;
                    });
                });
            });
        });
    })
}

/*
*  This is the function which used to find user password if user forgot password
*/
exports.UpdateImageInfo = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }
    let params =  {email:req.body.email}
    users.findOne(params, function (err, user) {
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
                message:"User not found"
            });
            return;
        }  
        if(user.status == "inactive") {
            res.json({
                status: false,
                message:"Your account has been inactive. Contact admin to activate your account"
            });
            return;
        }
        if(user.status == "blocked") {
            res.json({
                status: false,
                message:"Your account has been blocked. Contact admin to unblock your account"
            });
            return;
        }

        let params = {};
        if(req.body.profile_image){
            params = {
                'profile_image': req.body.profile_image,
                'status': 'active'
            }
            user.profile_image = req.body.profile_image;
        } else if(req.body.profile_cover){
            params = {
                'profile_cover': req.body.profile_cover,
                'status': 'active'
            }
            user.profile_cover = req.body.profile_cover;
        }
        
        users.updateMany({_id: user._id}, {'$set': params}, function(err) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return
            }    
            let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,profile_image:user.profile_image ? user.profile_image : '',profile_cover:user.profile_cover ? user.profile_cover : '',status:user.status,dob:user.dob,phone:user.phone, role:user.role,public_key:user.public_key,paypal:user.paypal},
                config.secret_key,
                { expiresIn: '24h' // expires in 24 hours
                }
                );
            res.json({
                status: true,
                token:token,
                message:"Image info updated",
            });
            return;
        });
    })
}

/*
*  This is the function which used to change password
*/
exports.changepassword = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }
    users.findOne({_id:req.decoded.user_id}, function (err, user) {
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
                message: "Request failed",
                errors:"User not found"
            });
            return;
        } 
        
        user.comparePassword(req.body.oldpassword, (error, match) => {
            if(!match) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:"The old password you have entered for this account is incorrect",
                });
                return;
            }

            if(user.status == 'inactive') {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:"Your account has been inactive. Contact admin to activate your account"
                });
                return;
            }

            if(user.status == 'blocked') {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:"Your Account has been blocked. Contact Admin to activate your account"
                });
                return;
            }

            // override the cleartext password with the hashed one
            user.password = req.body.newpassword;
            bcrypt.genSalt(12, function(err, salt) {
                if (err) return;
                // hash the password using our new salt
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if (err) return;
                    // override the cleartext password with the hashed one
                    user.password = hash;
                    user.status = "active"
                    let params ={
                        'password': user.password,
                        'status': user.status
                    };
                    
                    users.updateMany({_id: user._id}, {'$set': params}, function(err) {
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
                            message:"Password changed",
                        });
                        return;
                    });
                });
            });

        });
    })
}  

/*
*  This is the function which used to change password
*/
exports.resetpassword = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }
    users.findOne({_id:req.decoded.user_id}, function (err, user) {
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
                message:"User not found"
            });
            return;
        } 
        // override the cleartext password with the hashed one
        user.password = req.body.newpassword;
        bcrypt.genSalt(12, function(err, salt) {
            if (err) return;
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return;
                // override the cleartext password with the hashed one
                user.password = hash;
                user.status = "active"
                let params ={
                    'password': user.password,
                    'status': user.status
                };
                
                users.updateMany({_id: user._id}, {'$set': params}, function(err) {
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
                        message:"Password reseted",
                    });
                    return;
                });
            });
        });
    })
}

/*
*  This is the function which used to update user profile
*/
exports.update = function(req,res) {
    var user_id = req.decoded.user_id;  
    var params = {};
    params['_id'] = { $ne :  user_id };
    var query  = users.find();
    if (req.body.email) {
        params['email'] = req.body.email;        
    }  
    if (req.body.username) {
        params['username'] = req.body.username;        
    }  

    query = users.find(params); 
    query.exec( function (err, data) { 
        if(req.body.email || req.body.username) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            console.log("user data are ", data);
            if(data.length>0) {
                res.json({
                    status: false,
                    message:"Email or Username already exist"
                });
                return;
            } 
        }

        users.findOne({_id:req.decoded.user_id}, function (err, user) {
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
                        message:"User not found"
                    });
                    return;
                } 
                if(user.status == 'inactive') {
                    res.json({
                        status: false,
                        message:"Your account has been inactive. Contact admin to activate your account"
                    });
                    return;
                }
                if(user.status == 'blocked') {
                    res.json({
                        status: false,
                        message:"Your account has been blocked. Contact admin to activate your account"
                    });
                    return;
                }
                user.first_name = req.body.first_name ? req.body.first_name : user.first_name;
                user.last_name = req.body.last_name ? req.body.last_name : user.last_name;      
                user.email = req.body.email ? req.body.email : user.email;         
                user.username = req.body.username ? req.body.username : user.username;           
                user.paypal = req.body.paypal ? req.body.paypal : user.paypal;
                user.phone = req.body.phone ? req.body.phone : user.phone;
                
                user.modified_date = moment().format();
                // save the user and check for errors
                let params ={
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone': user.phone,
                    'paypal': user.paypal
                };
                
                users.updateMany({_id: user._id}, {'$set': params}, function(err) {
                    if (err) {
                        res.json({
                            status: false,
                            message: "Request failed",
                            errors:err
                        });
                        return
                    }    
                    let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,profile_image:user.profile_image ? user.profile_image : '',profile_cover:user.profile_cover ? user.profile_cover : '',status:user.status,dob:user.dob,phone:user.phone, role:user.role,public_key:user.public_key,paypal:user.paypal},
                        config.secret_key,
                        { expiresIn: '24h' // expires in 24 hours
                        }
                        );
                    res.json({
                        status: true,
                        token:token,
                        message:"User info updated",
                    });
                    return;
                });
            });
        })
}

/*
*   This is the function which get user balances from infura
*/
exports.getBalances = async function(req, res) {
    let w_result = await getBalances(req.decoded.public_key);
    res.json({
        status: true,
        message: "get balances successfully",
        data: w_result
    })
} 

/*
*   This is the function which get user erc20 balances from infura
*/
exports.getErc20Balances = async function(req, res) {
    let erc20Address = req.body.erc20Address ? req.body.erc20Address : '';
    let w_result = await getErc20Balances(req.decoded.public_key, erc20Address);
    res.json({
        status: true,
        message: "get balances successfully",
        data: w_result
    })
} 

/**
 * This is the function which used to process login user
 */
loginUser = function(params,req,res) {
    users.findOne(params, function (err, user) {
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
        user.comparePassword(req.body.password, (error, match) => {
            if(!match) {
                res.json({
                    status: false,
                    message: "Password is mismatch"
                });
                return;
            }
            if( user.status == 'inactive') {
                res.json({
                    status: false,
                    message: "Your account has been inactive. contact admin to activate your account",
                });
                return;
            }
            if(user.status == 'blocked') {
                res.json({
                    status: false,
                    message: "Your account has been blocked. contact admin to activate your account",
                });
                return;
            }        

            const opt_code = random(100000, 999999);
            const activation_code = crypto.createHash('md5').update(opt_code.toString()).digest('hex');

            mailer.mail({
                Name : user.first_name + ' ' + user.last_name,
                content:"For verify your email address, enter this verification code when prompted: "+ opt_code
            },user.email,'Email Verification',config.site_email,function(error,result) {
                if(error) {
                    console.log("email not working");
                }   
                user.activation_code = activation_code;
                user.opt_code = opt_code;

                users.updateMany({_id: user._id}, {'$set': {
                    'activation_code': activation_code,
                    'opt_code': opt_code
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
                        activation_code:activation_code,
                        opt_code: opt_code,
                        message:"Login successful",
                    }); 
                });
            });
        });
    });
}

/*
*   This is the function handle user registration
*/
registerUser = function (req,res) { 
    
    var user = new users();
    user.username = req.body.username ? req.body.username : "";
    user.email = req.body.email ? req.body.email : "";
    user.password = req.body.password ? req.body.password : "";
    user.first_name = req.body.first_name ? req.body.first_name : "";
    user.last_name = req.body.last_name ? req.body.last_name : "";
    user.phone = req.body.phone ? req.body.phone : "";
    user.profile_image = req.body.profile_image ? req.body.profile_image : "";
    user.dob = req.body.dob ? req.body.dob : "";
    user.profile_cover = req.body.profile_cover? req.body.profile_cover : "";
    user.paypal = req.body.paypal ? req.body.paypal : "";
    user.role = 2;
    user.status = 'active';
    
    let newAccount = createAccount();
    user.private_key = newAccount.privateKey;
    user.public_key = newAccount.address;

    // user.private_key = '9d852b0e29706008230c0dc25f52f0f856757808060a8e0ede187ff3f143c9fe';//private_key[0];
    // user.public_key = '0x87CF404e2357737be229e93E9F153b093232a46E';//public_key[0];
    const opt_code = random(100000, 999999);
    const activation_code = crypto.createHash('md5').update(opt_code.toString()).digest('hex');

    mailer.mail({
        Name : user.first_name + ' ' + user.last_name,
        content:"For verify your email address, enter this verification code when prompted: "+ opt_code
    },user.email,'Email Verification',config.site_email,function(error,result) {
        if(error) {
            console.log("email not working");
        }   
        user.activation_code = activation_code;
        user.opt_code = opt_code;

        user.save(function (err , user) {
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
                activation_code:activation_code,
                message:"Register successful",
            });   
        });
    });
}

/*
*  This function used to find whether user name exist or not
*/
checkUserNameExist = function (req,res,callback) {
    if(req.body.username) {
        users.find({'username':req.body.username},function(err,data) {
            if(err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            if(data.length>0) {
                res.json({
                    status: false,
                    message: "User Name already Exist",
                    errors:"User Name already Exist"
                });
                return;
            }
            callback(true)
        })
    } else {
        res.json({
            status: false,
            message: "User Name is required",
            errors:"User Name is required"
        });
        return;
    }
}

/*
*  This function used to find whether email exist or not
*/
checkEmailExist = function (req,res,callback) {
    if(req.body.email) {
        users.find({'email':req.body.email},function(err,data) {
            if(err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            if(data.length>0) {
                res.json({
                    status: false,
                    message: "Email already Exist",
                    errors:"Email already Exist"
                });
                return;
            }
            callback(true)
        })
    } else {
        res.json({
            status: false,
            message: "Email is required",
            errors:"Email is required"
        });
        return;
    }
}

/**
 *   This is the function check object is empty or not
 */
isEmptyObject = function (obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
}

/**
 * This is the function which used to process opt verification
 */
checkOpt = function(params,req,res) {
    users.findOne(params, function (err, user) {
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
        let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,profile_image:user.profile_image ? user.profile_image : '',profile_cover:user.profile_cover ? user.profile_cover : '',status:user.status,dob:user.dob,phone:user.phone, role:user.role,public_key:user.public_key,paypal:user.paypal},
                config.secret_key,
                { expiresIn: '24h' // expires in 24 hours
                }
                );
        res.json({
            status: true,
            token:token,
            message:"Verify successful",
        }); 
    });
}

