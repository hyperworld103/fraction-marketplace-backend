/*
Project : Cryptotrades
FileName : route.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all route releated to category api request.
*/

var express = require('express')
var router = express.Router();
var categoryController = require("./../controller/categoryController")
var adminauth = require("./../../../middleware/adminauth");
const { check } = require('express-validator');

router.get('/list',categoryController.getList)
router.get('/detail',categoryController.details);
router.get('/fulllist',adminauth,categoryController.getAdminList)
router.post('/add',[check('title').not().isEmpty(), check('status').not().isEmpty(),check('category_image').not().isEmpty(),adminauth],categoryController.add)
router.put('/edit',[check('category_id').not().isEmpty(),adminauth],categoryController.edit)
router.delete('/delete',[check('category_id').not().isEmpty(),adminauth],categoryController.delete)
module.exports = router