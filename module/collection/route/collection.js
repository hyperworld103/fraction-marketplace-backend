/*
Project : Cryptotrades
FileName : collection.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all route releated to collecion api request.
*/

var express = require('express')
var router = express.Router();
var collectionController = require("./../controller/collectionController")
var auth = require("./../../../middleware/auth");
var adminauth = require("./../../../middleware/adminauth");
var optionalauth = require("./../../../middleware/optionalauth");
const { check } = require('express-validator');

router.post('/add',[check('name').not().isEmpty(),auth],collectionController.add)
router.post('/list',optionalauth,collectionController.list)
router.post('/detail',collectionController.view)
router.post('/delete',[check('collection_id').not().isEmpty(),auth],collectionController.delete)
router.post('/update',[check('contract_address').not().isEmpty(),check('name').not().isEmpty(),auth],collectionController.update)

router.post('/fulllist',adminauth,collectionController.getAdminCollectionList)

module.exports = router