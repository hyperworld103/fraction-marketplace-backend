/*
Project : Cryptotrades
FileName : adminController.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all admin related api function.
*/

var admins = require('../model/adminModel')
var jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt');
var validator = require('validator');
var config = require('../../../helper/config')
var moment = require('moment');
var mailer = require('../../common/controller/mailController'); 
var media = require('../../media/controller/mediaController'); 
var cp = require('child_process');
const crypto = require('crypto');
const { random, add } = require('lodash');
/*
*  This is the function which used to retreive admin list
*/
exports.exist = async function(req,res) {
    admins.countDocuments().then((count) =>{
        res.json({
            status: true,
            message: "Admin count",
            count: count
        });
    });
}

/*
*  This is the function which used to create new admin in Cryptotrades
*/
exports.register = function(req,res) {
    this.checkAdminEmailExist(req,res,function(result){
        this.registeradmin(req,res);
     });
}

/**
 *   This is the function handle admin registration
 */
registeradmin = function (req,res) { 
    
    var admin = new admins();
    admin.email = req.body.email ? req.body.email : "";
    admin.password = req.body.password ? req.body.password : "";  
    admin.phone = '';
    admin.private_key = '';
    admin.public_key = '';
    admin.paypal = '';

    admin.save(function (err , admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        } 
        let token = jwt.sign({admin_id:admin._id,email: admin.email,phone:admin.phone,public_key:admin.public_key,paypal:admin.paypal},
                    config.secret_key,
                    { expiresIn: '24h' // expires in 24 hours
                    }
                    );
        res.json({
            status: true,
            token:token,
            message:"Admin Created",
        });  
    });
}

/*
*  This function used to find whether email exist or not
*/
checkAdminEmailExist = function (req,res,callback) {
    if(req.body.email) {
        admins.find({'email':req.body.email},function(err,data) {
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
 * This is the function which used to login admin
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

    if(validator.isEmail(req.body.email)) {
        params = {email:req.body.email};
    }
    this.loginadmin(params,req,res);
}

/**
 * This is the function which used to process login admin
 */
loginadmin = function(params,req,res) {
    admins.findOne(params, function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            res.json({
                status: false,
                message: "admin not found",
            });
            return;
        }  
        admin.comparePassword(req.body.password, (error, match) => {
            if(!match) {
                res.json({
                    status: false,
                    message: "Password is mismatch"
                });
                return;
            }
   
            let token = jwt.sign({admin_id:admin._id,email: admin.email,phone:admin.phone,public_key:admin.public_key,paypal:admin.paypal},
                config.secret_key,
                { expiresIn: '24h' // expires in 24 hours
                }
                );
            res.json({
                status: true,
                token:token,
                message:"Login Successful",
            });  
        });
    });
}

/*
*  This is the function which used to find admin password if admin forgot password
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
    admins.findOne(params, function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            res.json({
                status: false,
                message:"admin not found"
            });
            return;
        }  

        let newpassword = randomstring.generate({
            length: 6,
            charset: 'alphabetic'
          });  

        admin.password = newpassword;
        bcrypt.genSalt(12, function(err, salt) {
            if (err) return;
            // hash the password using our new salt
            bcrypt.hash(admin.password, salt, function(err, hash) {
                if (err) return;
                // override the cleartext password with the hashed one
                admin.password = hash;
                
                admins.updateMany({_id: admin._id}, {'$set': {
                    'password': admin.password
                }}, function(err) {
                    if (err) {
                        res.json({
                            status: false,
                            message: "Request failed",
                            errors:err
                        });
                        return
                    }    
                    // mailer.mail({
                    //     Name : 'Admin',
                    //     content:"Your new password is "+ newpassword
                    // },admin.email,'Password Reset',config.site_email,function(error,result) {
                    //     if(error) {
                    //         console.log("email not working");
                    //     }   
     
                        console.log("new password is ", newpassword)
                        res.json({
                            status: true,
                            message: "Email sent. Please refer your email for new password"
                        });
                        return;
                    // });
                });
            });
        });
    })
}

/*
*  This is the function which used to update admin profile
*/
exports.update = function(req,res) {
    admins.findOne({_id:req.decoded.admin_id}, function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            res.json({
                status: false,
                message:"admin not found"
            });
            return;
        } 
      
        admin.email = req.body.email ? req.body.email : admin.email;                 
        admin.paypal = req.body.paypal ? req.body.paypal : admin.paypal;
        admin.phone = req.body.phone ? req.body.phone : admin.phone;
        
        admin.modified_date = moment().format();
        // save the admin and check for errors
        let params ={
            'email': admin.email,
            'phone': admin.phone,
            'paypal': admin.paypal
        };
        
        admins.updateMany({_id: admin._id}, {'$set': params}, function(err) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return
            }    
            let token = jwt.sign({admin_id:admin._id,email: admin.email,phone:admin.phone,public_key:admin.public_key,paypal:admin.paypal},
                config.secret_key,
                { expiresIn: '24h' // expires in 24 hours
                }
                );
            res.json({
                status: true,
                token:token,
                message:"admin info updated",
            });
            return;
        });
    });
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
    admins.findOne({_id:req.decoded.admin_id}, function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"admin not found"
            });
            return;
        } 
        
        admin.comparePassword(req.body.oldpassword, (error, match) => {
            if(!match) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:"The old password you have entered for this account is incorrect",
                });
                return;
            }

            // override the cleartext password with the hashed one
            admin.password = req.body.newpassword;
            bcrypt.genSalt(12, function(err, salt) {
                if (err) return;
                // hash the password using our new salt
                bcrypt.hash(admin.password, salt, function(err, hash) {
                    if (err) return;
                    // override the cleartext password with the hashed one
                    admin.password = hash;
                    let params ={
                        'password': admin.password
                    };
                    
                    admins.updateMany({_id: admin._id}, {'$set': params}, function(err) {
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
*  This is the function which used to retreive admin list
*/
exports.getListByIds = async function(req,res) {
    var query = admins.find({ '_id' : { $in : req.body.admins }});
    query.select('_id first_name last_name profile_image');
    query.exec( function (err, data) { 
        res.json({
            status: true,
            message: "admins retrieved successfully",
            data: data
        });
    });    
}

/*
*  This is the function which used to retreive admin detail by admin id
*/
exports.details = function(req,res) {
    console.log("received params are ", req.params)
    admins.findOne({_id:req.params.adminId}).select('adminname email first_name last_name profile_image profile_cover public_key password status create_date').exec( function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"admin not found"
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"admin not found"
            });
            return;
        } 
        res.json({
            status: true,
            message: "Profile info retrieved successfully",
            result: admin
        });
    })
}

/**
 *   This is the function check object is empty or not
 */
exports.getadminInfo = function (req,res) {
    const address = req.body.public_key;
    admins.findOne({public_key:address}).exec( function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            let admin = new admins();
            admin.adminname = randomstring.generate({length: 6, charset: 'alphabetic'});
            admin.email = address + '@test.com';
            admin.first_name = randomstring.generate({length: 6, charset: 'alphabetic'});
            admin.last_name = randomstring.generate({length: 6, charset: 'alphabetic'});
            admin.public_key = address;
            admin.save(function (err , admin) {
                if (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors:err
                    });
                    return;
                } 
                let token = jwt.sign({admin_id:admin._id,adminname: admin.adminname,email: admin.email,first_name:admin.first_name,last_name:admin.last_name,profile_image:admin.profile_image ? admin.profile_image : '',profile_cover:admin.profile_cover ? admin.profile_cover : '',status:admin.status,dob:admin.dob,phone:admin.phone, role:admin.role,public_key:admin.public_key,paypal:admin.paypal},
                    config.secret_key,
                    { expiresIn: '24h' // expires in 24 hours
                    }
                    );
                res.json({
                    status: true,
                    token:token,
                    message:"admin Created",
                });
            });
        } else {
            let token = jwt.sign({admin_id:admin._id,adminname: admin.adminname,email: admin.email,first_name:admin.first_name,last_name:admin.last_name,profile_image:admin.profile_image ? admin.profile_image : '',profile_cover:admin.profile_cover ? admin.profile_cover : '',status:admin.status,dob:admin.dob,phone:admin.phone, role:admin.role,public_key:admin.public_key,paypal:admin.paypal},
            config.secret_key,
            { expiresIn: '24h' // expires in 24 hours
            }
            );
            res.json({
                status: true,
                token:token,
                message:"admin Exist",
            }); 
        }

    })
}


/**
 * This is the function which used to login admin
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

/**
 * This is the function which used to process opt verification
 */
checkOpt = function(params,req,res) {
    admins.findOne(params, function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            res.json({
                status: false,
                message: "admin not found",
            });
            return;
        } 
        let token = jwt.sign({admin_id:admin._id,adminname: admin.adminname,email: admin.email,first_name:admin.first_name,last_name:admin.last_name,profile_image:admin.profile_image ? admin.profile_image : '',profile_cover:admin.profile_cover ? admin.profile_cover : '',status:admin.status,dob:admin.dob,phone:admin.phone, role:admin.role,public_key:admin.public_key,paypal:admin.paypal},
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


/*
*  This is the function which used to find admin password if admin forgot password
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
    admins.findOne(params, function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            res.json({
                status: false,
                message:"admin not found"
            });
            return;
        }  
        if(admin.status == "inactive") {
            res.json({
                status: false,
                message:"Your account has been inactive. Contact admin to activate your account"
            });
            return;
        }
        if(admin.status == "blocked") {
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
            admin.profile_image = req.body.profile_image;
        } else if(req.body.profile_cover){
            params = {
                'profile_cover': req.body.profile_cover,
                'status': 'active'
            }
            admin.profile_cover = req.body.profile_cover;
        }
        
        admins.updateMany({_id: admin._id}, {'$set': params}, function(err) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return
            }    
            let token = jwt.sign({admin_id:admin._id,adminname: admin.adminname,email: admin.email,first_name:admin.first_name,last_name:admin.last_name,profile_image:admin.profile_image ? admin.profile_image : '',profile_cover:admin.profile_cover ? admin.profile_cover : '',status:admin.status,dob:admin.dob,phone:admin.phone, role:admin.role,public_key:admin.public_key,paypal:admin.paypal},
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
    admins.findOne({_id:req.decoded.admin_id}, function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            res.json({
                status: false,
                message:"admin not found"
            });
            return;
        } 
        // override the cleartext password with the hashed one
        admin.password = req.body.newpassword;
        bcrypt.genSalt(12, function(err, salt) {
            if (err) return;
            // hash the password using our new salt
            bcrypt.hash(admin.password, salt, function(err, hash) {
                if (err) return;
                // override the cleartext password with the hashed one
                admin.password = hash;
                admin.status = "active"
                let params ={
                    'password': admin.password,
                    'status': admin.status
                };
                
                admins.updateMany({_id: admin._id}, {'$set': params}, function(err) {
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
*  This is the function which used to update admin profile
*/
exports.updatesettings = function(req,res) {
    admins.findOne({_id:req.decoded.admin_id}, function (err, admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(admin)) {
            res.json({
                status: false,
                message:"admin not found"
            });
            return;
        } 
        if(admin.status == 'inactive') {
            res.json({
                status: false,
                message:"Your account has been inactive. Contact admin to activate your account"
            });
            return;
        }
        if(admin.status == 'blocked') {
            res.json({
                status: false,
                message:"Your account has been blocked. Contact admin to activate your account"
            });
            return;
        }
        admin.is_notification = req.body.is_notification;        
        admin.modified_date = moment().format();
        admin.save(function (err , admin ) {
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
                message:"profile settings updated successfully",
            }); 
                    
        });
    });
}

/**
 *   This is the function check object is empty or not
 */
exports.getadminInfoByID = function (adminId, callback) {
    admins.findOne({_id:adminId}).exec( function (err, admin) {
        if (err) {
            callback(err,null)
            return;
        }
        if(this.isEmptyObject(admin)) {
            callback({
                status: false,
                message: "Request failed",
                errors:"admin not found"
            },null);
            return;
        } 
        admin.profile_image = admin.profile_image ? admin.profile_image : '';       
        callback(null,admin)
    })
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

/*
*   This is the function which used to create new admin from admin
*/
exports.createadmin = function(req,res) {

    this.checkadminNameExist(req,res,function(result) {
        if(result) {
            this.checkEmailExist(req,res,function(result){
                this.createadmin(req,res);
            });
        }
    })
    
}

/**
 *    This is the function handle admin registration for admin
 */
 createadmin = function (req,res) { 
    
    var admin = new admins();
    admin.adminname = req.body.adminname ? req.body.adminname : "";
    admin.email = req.body.email ? req.body.email : "";
    admin.password = req.body.password ? req.body.password : "";
    admin.first_name = req.body.first_name ? req.body.first_name : "";
    admin.last_name = req.body.last_name ? req.body.last_name : "";
    admin.phone = req.body.phone ? req.body.phone : "";
    admin.profile_image = req.body.profile_image ? req.body.profile_image : "";
    admin.dob = req.body.dob ? req.body.dob : "";
    admin.status = req.body.status ? req.body.status : "active"
    admin.save(function (err , admin) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        } 
        if(admin.email) {
        mailer.mail({
            adminname : admin.first_name + ' ' + admin.last_name,
            content:"Congratulation, you account has been created in "+config.site_name
        },admin.email,'Registration Confirmation',config.site_email,function(error,result) {
            if(error) {
            }
            res.json({
                status: true,
                message:"Registration successful",
            });
        })
        } else {
            res.json({
                status: true,
                message:"Registration successful",
            });
        }  
    });
}

/*
*   This is the function which used to update admin profile from admin
*/
exports.updateadmin = function(req,res) {
    var admin_id = req.body.admin_id;  
    var params = {};
    params['_id'] = { $ne :  admin_id };
    var query  = admins.find();
    if (req.body.email) {
        params['email'] = req.body.email;        
    }  
    if (req.body.adminname) {
        params['adminname'] = req.body.adminname;        
    }  
    query = admins.find(params); 
    query.exec( function (err, data) { 
        if(req.body.email || req.body.adminname) {
            if (err) {
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
                    message:"Email or adminname already exist"
                });
                return;
            } 
        }

        admins.findOne({_id:req.body.admin_id}, function (err, admin) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            if(this.isEmptyObject(admin)) {
                res.json({
                    status: false,
                    message:"admin not found"
                });
                return;
            } 
            admin.first_name = req.body.first_name ? req.body.first_name : admin.first_name;
            admin.last_name = req.body.last_name ? req.body.last_name : admin.last_name;
            admin.profile_image = req.body.profile_image ? req.body.profile_image : admin.profile_image;                 
            admin.profile_cover = req.body.profile_cover ? req.body.profile_cover : admin.profile_cover;       
            admin.email = req.body.email ? req.body.email : admin.email;         
            admin.adminname = req.body.adminname ? req.body.adminname : admin.adminname;           
            admin.dob = req.body.dob ? req.body.dob : admin.dob;
            admin.phone = req.body.phone ? req.body.phone : admin.phone;
            if(req.body.password) {
                admin.password = req.body.password
            }
            admin.status = req.body.status ? req.body.status : ''
            admin.modified_date = moment().format();
            admin.save(function (err , admin ) {
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
                    message:"profile updated successfully",
                });                         
            });
        });
    })
}



