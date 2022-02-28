/*
Project : Cryptotrades
FileName : adminauth.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which used to check whether user is authorized or not to use Admin API.
*/

let jwt = require('jsonwebtoken');
const config = require('./../helper/config');

let adminauth = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; 
  if(token == null) {
    return res.json({
        status: false,
        message: 'Auth token is not supplied'
      }); 
  }
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, config.secret_key, (err, decoded) => {
      if (err) {
        return res.json({
          status: false,
          message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.json({
      status: false,
      message: 'Auth token is not supplied'
    });
  }
};

module.exports = adminauth