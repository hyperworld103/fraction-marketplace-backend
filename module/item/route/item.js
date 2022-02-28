/*
Project : Cryptotrades
FileName : item.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all route releated to collecion api request.
*/

var express = require('express')
var router = express.Router();
var itemController = require("./../controller/itemController")
var auth = require("./../../../middleware/auth");
var adminauth = require("./../../../middleware/adminauth");
var optionalauth = require("./../../../middleware/optionalauth");
const { check } = require('express-validator');

router.post('/fullist',adminauth,itemController.getAdminItemList)

router.post('/add',[check('name').not().isEmpty(), check('description').not().isEmpty(),check('category').not().isEmpty(),check('collection_id').not().isEmpty(),check('thumb').not().isEmpty(),check('cid').not().isEmpty(),auth],itemController.add)

router.post('/list',auth,itemController.list)

router.post('/detail',[check('item_id').not().isEmpty()],auth,itemController.detail)

router.post('/fractionApprove',[check('address').not().isEmpty(),check('tokenId').not().isEmpty()],auth,itemController.fractionApprove)

router.post('/getFractionApprove',[check('address').not().isEmpty(),check('tokenId').not().isEmpty()],auth,itemController.getFractionApprove)

router.post('/getConfirmations',[check('hash').not().isEmpty()],itemController.getConfirmations)

router.post('/fractionalize',[check('erc721Address').not().isEmpty(),check('erc721Id').not().isEmpty()],auth,itemController.fractionalize)

router.post('/fractionAdd',[check('item_id').not().isEmpty()],auth,itemController.addFractions)

router.post('/fractionList',[check('chainId').not().isEmpty()],auth,itemController.fractionList)

router.post('/fractionMarketList',[check('chainId').not().isEmpty()],auth,itemController.fractionMarketList)

router.post('/fractionGet',[check('chainId').not().isEmpty()],auth,itemController.fractionGet)

module.exports = router