/*
Project : Cryptotrades
FileName : userInfura.js
Author : LinkWell
File Created : 11/10/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all user related infura api function.
*/
let collectionAbi = require('../../../abi/collection.json')
let erc721Abi = require('../../../abi/erc721.json')
let fractionAbi = require('../../../abi/fractions.json')
let auctionFractionAbi = require('../../../abi/auction.json')
let erc20SharesAbi = require('../../../abi/erc20shares.json')
let erc20AuctionAbi = require('../../../abi/erc20NftfyAuction.json')
let erc20Abi = require('../../../abi/erc20.json')
const config = require('../../../helper/config')
const { scale } = require('../../../helper/common')
const { ethers } = require('ethers');
// const Web3 = require("web3");
// const web3js = new Web3(new Web3.providers.HttpProvider(config.infura.base_url));

/**
 @desc: generate a token_id
**/
exports.generateTokenId = async function(private_key, collection_address, item_count) {
    let w_result = 0;
    const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
    const wallet = new ethers.Wallet(private_key, infuraProvider);
    const signer = wallet.connect(infuraProvider);
    let contract = new ethers.Contract(collection_address, collectionAbi, signer);

    // Call the contract, getting back the transaction
    try {
		console.log('baseIndex=============================================')
		let baseIndex = await contract.getBaseIndex();
        w_result = BigInt(baseIndex) + BigInt(item_count);
    } catch(e) {
        console.log(e)
    }

	return w_result;
}

/**
 @desc: create a NFT item
**/
exports.createItem = async function(public_key, private_key, cid, token_id, collection_address) {
    let w_result = false;
    const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
    const wallet = new ethers.Wallet(private_key, infuraProvider);
    const signer = wallet.connect(infuraProvider);
    let contract = new ethers.Contract(collection_address, collectionAbi, signer);
    let nonce = await signer.getTransactionCount('latest', 'pending')

    let options = {
        gasLimit: 300000,
        nonce: nonce,
        value: 0    
    };
 
    // Call the contract, getting back the transaction
    try {
		console.log('mint====================================')
        let mint = await contract.mint(cid, BigInt(token_id), public_key, options)
        w_result = true;
    } catch(e) {
        console.log(e)
    }

	return w_result;
}

exports.fracApprove = async function(privateKey, address, tokenId, auction) {
    let w_result = '';
    const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
    const wallet = new ethers.Wallet(privateKey, infuraProvider);
    const signer = wallet.connect(infuraProvider);
  try {
      let contractErc721 = new ethers.Contract(address, erc721Abi, signer);
      if(auction){
        w_result = await contractErc721.approve(config.infura.auction_address, tokenId);
      } else {
        w_result = await contractErc721.approve(config.infura.fractions_address, tokenId);
      }

  } catch (e) {
    console.log(e)
  }

  return w_result;
}

exports.getFracApprove = async function(privateKey, address, tokenId, auction) {
  let w_result = false;
  const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
  const wallet = new ethers.Wallet(privateKey, infuraProvider);
  const signer = wallet.connect(infuraProvider);
  
  try {
    let contractErc721 = new ethers.Contract(address, erc721Abi, signer);
    w_result = await contractErc721.methods.getApproved(tokenId);
    if(auction) {
      w_result = w_result === config.infura.auction_address;
    } else {
      w_result = w_result === config.infura.fractions_address;
    }
  } catch (e) {
    console.log(e)
  }

  return w_result;
}

exports.getConfirmations = async function(hash) {
  let w_result = 0;
  const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
  try {
    let trx = await infuraProvider.getTransaction(hash);
    let currentBlock = await infuraProvider.getBlockNumber();
    // let trx = await web3js.eth.getTransaction(hash);
    // const currentBlock = await web3js.eth.getBlockNumber()
    w_result = trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber
  } catch (e) {
    console.log(e)
  }
  return w_result;
}

exports.fractionalize = async function(privateKey, erc721Address, erc721Id, unit, name, symbol, decimals, price, paymentTokenAddress) {

  let w_result = '';
  const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
  const wallet = new ethers.Wallet(privateKey, infuraProvider);
  const signer = wallet.connect(infuraProvider);
  try {
    let contractNftfy = new ethers.Contract(config.infura.fractions_address, fractionAbi, signer);
    w_result =   await contractNftfy.methods
    .fractionalize(
      erc721Address,
      erc721Id,
      name,
      symbol,
      decimals,
      unit,
      price,
      paymentTokenAddress === config.infura.eth ? config.infura.eth_address : paymentTokenAddress
    )
  } catch (e) {
    console.log(e)
  }

  return w_result;
}

exports.auctionFractionalize = async function (privateKey, erc721Address, erc721Id, unit1, name, symbol, decimals, price, paymentTokenAddress, kickoff, duration, unit2){
  let w_result = '';
  const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
  const wallet = new ethers.Wallet(privateKey, infuraProvider);
  const signer = wallet.connect(infuraProvider);
  try {
    let contractNftfy = new ethers.Contract(config.infura.auction_address, auctionFractionAbi, signer);
    w_result =   await contractNftfy.methods
    .fractionalize(
      erc721Address,
      erc721Id,
      name,
      symbol,
      decimals,
      unit1,
      price,
      paymentTokenAddress === config.infura.eth ? config.infura.eth_address : paymentTokenAddress,
      kickoff,
      duration,
      unit2
    )
  } catch (e) {
    console.log(e)
  }

  return w_result;  
}

exports.getFractionsAddress = async function(privateKey, auction) {
  let w_result = '';
  const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
  const wallet = new ethers.Wallet(privateKey, infuraProvider);
  const signer = wallet.connect(infuraProvider);
  if(auction){
    let contractNftfy = new ethers.Contract(config.infura.auction_address, auctionFractionAbi, signer);
    w_result = await contractNftfy.methods.getFractionsAddress();
  } else {
    let contractNftfy = new ethers.Contract(config.infura.fractions_address, fractionAbi, signer);
    w_result = await contractNftfy.methods.getFractionsAddress();
  }

  return w_result;
}

exports.excecQuery = async function (privateKey, item) {

  const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
  const wallet = new ethers.Wallet(privateKey, infuraProvider);
  const signer = wallet.connect(infuraProvider);
  let contractERC20share;
  if(item.frac_id.type == "set_price")
    contractERC20share = new ethers.Contract(item.frac_id.fractionAddress, erc20SharesAbi, signer)
  else
    contractERC20share = new ethers.Contract(item.frac_id.fractionAddress, erc20AuctionAbi, signer) 
  let w_balance = await contractERC20share.methods.balanceOf(account)
  let w_vaultBalance = await contractERC20share.methods.vaultBalance()
  let w_released = await contractERC20share.methods.released()
  let w_totalSupply = await contractERC20share.methods.totalSupply()
  let w_reservePrice = await contractERC20share.methods.reservePrice()
  let w_redeemAmount = 0
  let w_cutoff = -1
  if(item.frac_id.type == "set_price")
  {
    w_redeemAmount = await contractERC20share.methods.redeemAmountOf(account)
  } else if(item.frac_id.type == "auction") {
    w_cutoff = await contractERC20share.methods.cutoff()
    if(~w_cutoff < 0)
      w_cutoff = ~w_cutoff
  }
  let contractERC20 = new ethers.Contract(item.frac_id.paymentToken, erc20Abi, signer)

  let w_payment_symbol = await contractERC20.methods.symbol()
  let w_payment_decimals = await contractERC20.methods.decimals()

  return {
    balance: w_balance,
    vaultBalance: w_vaultBalance,
    redeemAmount: w_redeemAmount,
    frac: {
      cutoff: w_cutoff,
      id: item.frac_id.fractionAddress,
      name: item.frac_id.name,
      symbol: item.frac_id.symbol,
      totalSupply: w_totalSupply,
      reservePrice: w_reservePrice,
      timestamp: item.frac_id.create_date,
      decimals: item.frac_id.decimals,
      released: w_released,
      paymentToken: {
        id: item.frac_id.paymentToken,
        symbol: w_payment_symbol,
        decimals: w_payment_decimals
      },
      target: {
        id: item._id,
        collection: {
          id: item.collection_id.contract_address,
          name: item.collection_id.name,
          symbol: item.collection_id.contract_symbol
        },
        tokenId: item.token_id,
        tokenURI: 'https://ipfs.io/ipfs/' + item.cid
      }
    }
  }
}

exports.marketplaceExecuteQuery = async function (privateKey, item, activeFilters=null) {
  if(!item.frac_id)
    return;

  const infuraProvider = new ethers.providers.InfuraProvider('ropsten', 'b87b96a22d544319809fa30f8405f44d');
  const wallet = new ethers.Wallet(privateKey, infuraProvider);
  const signer = wallet.connect(infuraProvider);

  let contractERC20share
  if(item.frac_id.type == "set_price")
    contractERC20share = new ethers.Contract(item.frac_id.fractionAddress, erc20SharesAbi, signer)
  else
    contractERC20share = new ethers.Contract(item.frac_id.fractionAddress, erc20AuctionAbi, signer) 
  
  let w_status = await contractERC20share.methods.status()
  
  if(w_status == 'PAUSE')
    w_status = 'PAUSE_OR_OFFER'
  else if(w_status == 'OFFER' && item.frac_id.type == 'set_price')
    w_status = 'OFFER'
  else if(w_status == 'OFFER')
    w_status = 'PAUSE_OR_OFFER'
  else if(w_status == 'AUCTION')
    w_status = 'AUCTION'
  else if(w_status == 'SOLD' && item.frac_id.type == 'set_price')
    w_status = 'SOLD'
  else
    w_status = 'AUCTION_OR_SOLD'

  if(!!activeFilters)
  {
    if(activeFilters == 'startAuction' && !(w_status == 'PAUSE_OR_OFFER')){
      return;
    } else if(activeFilters == 'liveAuction' && !(w_status == 'AUCTION')){
      return;
    } else if(activeFilters == 'buyNow' && !(w_status == 'SOLD')){
      return;
    } else if(activeFilters == 'recentSold' && !(w_status == 'AUCTION_OR_SOLD')) {
      return;
    }
  }

  let w_type = config.infura.AUCTION
  if(item.frac_id.type == 'set_price')
    w_type = config.infura.SET_PRICE

  let w_vaultBalance = await contractERC20share.methods.vaultBalance()
  w_vaultBalance = scale(new BigNumber(w_vaultBalance), -item.frac_id.decimals).toString()

  let w_released = await contractERC20share.methods.released()

  let w_totalSupply = await contractERC20share.methods.totalSupply()
  w_totalSupply = scale(new BigNumber(w_totalSupply), -item.frac_id.decimals).toString()

  let w_cutoff = -1
  if(item.frac_id.type == "auction") {
    w_cutoff = await contractERC20share.methods.cutoff()
    if(~w_cutoff < 0)
      w_cutoff = ~w_cutoff
  }

  let contractERC20 = new ethers.Contract(item.frac_id.paymentToken, erc20Abi, signer)

  let w_payment_symbol = await contractERC20.methods.symbol()
  let w_payment_decimals = await contractERC20.methods.decimals()
  let w_payment_name = await contractERC20.methods.decimals()
  
  let w_reservePrice = await contractERC20share.methods.reservePrice()

  w_reservePrice = scale(new BigNumber(w_reservePrice), -w_payment_decimals).toString()
  let w_sharePrice = scale(new BigNumber(item.frac_id.fractionPrice), -(w_payment_decimals - item.frac_id.decimals)).toString()
  let w_sharesCount = scale(new BigNumber(item.frac_id.fractionCount), -item.frac_id.decimals).toString()

  return {
    id: item.frac_id.fractionAddress,
    name: item.frac_id.name,
    symbol: item.frac_id.symbol,
    decimals: item.frac_id.decimals,
    exitPrice: w_reservePrice,
    released: w_released,
    timestamp: item.frac_id.create_date,
    sharePrice: w_sharePrice,
    sharesCount: w_sharesCount,
    totalSupply: w_totalSupply,
    vaultBalance: w_vaultBalance,
    type: w_type,
    status: w_status,
    cutoff: w_cutoff,
    minimumDuration: item.frac_id.days,
    bids: [],
    paymentToken: {
      id: item.frac_id.paymentToken,
      name: w_payment_name,
      symbol: w_payment_symbol,
      decimals: w_payment_decimals
    },
    target: {
      id: item._id,
      tokenId: item.token_id,
      tokenURI: 'https://ipfs.io/ipfs/' + item.cid,
      collection: {
        id: item.collection_id.contract_address,
        name: item.collection_id.name
      }
    }
  }
}  

