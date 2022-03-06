/*
Project : Cryptotrades
FileName :  config.js
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which maintain globl variable for the application
*/
const config = {
    app: {
      port: 5001
    },
    db: {
      host: 'localhost',
      port: 27017,
      username: '',
      password: '',
      name: 'nftmarketplace',
      prefix:'linkwell_'
    },
    mail: {
      type:"",
      smtp: {
        host: 'smtp.gmail.com',
        port: 465,
        secure:true,
        username:'trustbusiness2021@gmail.com',
        password:'trustteam2021'
      }

    },
    infura: {
      base_url: "https://ropsten.infura.io/v3/a0773a757edb4cbc9d5f27c7611cfb1b", // mainnet: 
      projectID: "a0773a757edb4cbc9d5f27c7611cfb1b",
      eth_address: "0x0000000000000000000000000000000000000000", //mainnet: 0x0000000000000000000000000000000000000000
      eth: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      usdc_address: "0x70cdfb73f78c51bf8a77b36c911d1f8c305d48e6", //mainnet: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
      collection_address: "0x32Fd26AC2F7F8f86E6b843d67ea91c5dD074e42D", //mainnet: 
      fractions_address: "0x8CC4e4CE2F9a88F945cbA47f71FBfA4882C3ea85", //mainnet: 
      auction_address: "0x0D3275e74DE43AB0D258A3a156BfD83E993be50b", //mainnet:
      market_address: "0xD8c5Ba2D2DC9B7c465650a575db5F1EC50f8019F", //mainnet: 

      boxes_address: "0xBAf042634d86530CFE56B38831053138Db8455C7", //mainnet: 
      vault1_address: "0x45AfaBFFD6E783D576f54647338654c172241963", //mainnet: 
      vault2_address: "0x390F4FbFA2aB3E1CEE4450C6c610ba73E5a9caca", //mainnet: 

      AUCTION: 'AUCTION',
      SET_PRICE: 'SET_PRICE',
      COLLECTIVE_PURCHASE: 'COLLECTIVE_PURCHASE'
    },
    site_name:'Cryptotrades',
    site_link:'#',
    site_email: 'trustbusiness2021@gmail.com',
    secret_key:'jfVRtwN7xBl7LjRucIUdPnrh1UVUhzhZ',
    public_key:'6gluXXunc77uukLJbSmlQ31ckSlLq8Qi'
   };
   
   
module.exports = config;