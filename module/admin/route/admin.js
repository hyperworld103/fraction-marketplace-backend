/*
Project : Cryptotrades
FileName : route.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all route releated to user api request.
*/

var express = require('express')
var router = express.Router();
var adminController = require("../controller/adminController")
const { check } = require('express-validator');
var auth = require("../../../middleware/auth");

router.post('/exist',adminController.exist)

router.post('/register',[check('email').isEmail(),check('password').not().isEmpty()], adminController.register)

router.post('/login',[check('email').isEmail(),check('password').not().isEmpty()],adminController.login)

router.post('/forgot',[check('email').isEmail()],adminController.forgot)

router.post('/update', [auth], adminController.update)

router.post('/change', [check('newpassword').not().isEmpty(),check('oldpassword').not().isEmpty(),auth],adminController.changepassword)

module.exports = router