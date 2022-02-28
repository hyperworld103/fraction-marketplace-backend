/*
Project : Cryptotrades
FileName : route.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all route releated to media controller
*/

var express = require('express')
var router = express.Router();
var mediaController = require("../controller/mediaController")
var auth = require("../../../middleware/auth");
var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'media/images/user')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
var avatarupload = multer({ storage: storage })

var coverstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/images/cover')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var coverupload = multer({ storage: coverstorage })

var collectionlogostorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/images/collection/logo')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var collectionlogoupload = multer({ storage: collectionlogostorage })

var collectionbannerstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/images/collection/banner')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var collectionbannerupload = multer({ storage: collectionbannerstorage })


var itemthumbstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/images/item/thumb')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var itemthumbupload = multer({ storage: itemthumbstorage })

var itemmediastorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/images/item/media')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var itemmediaupload = multer({ storage: itemmediastorage })

var categorystorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/images/categories')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var categoryupload = multer({ storage: categorystorage })


router.post('/avatar',avatarupload.single('file'),mediaController.uploadImage)
router.post('/cover',coverupload.single('file'),mediaController.uploadImage)
router.post('/collectionlogo',collectionlogoupload.single('file'),mediaController.uploadImage)
router.post('/collectionbanner',collectionbannerupload.single('file'),mediaController.uploadImage)
router.post('/itemthumb',itemthumbupload.single('file'),mediaController.uploadImage)
router.post('/itemmedia',itemmediaupload.single('file'),mediaController.uploadImage)
router.post('/category',categoryupload.single('file'),mediaController.uploadImage)
module.exports = router