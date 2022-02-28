/*
Project : Cryptotrades
FileName : userInfura.js
Author : LinkWell
File Created : 11/10/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all user related infura api function.
*/
let usdcAbi = require('../../../abi/usdc.json')
let erc20Abi = require('../../../abi/erc20.json')
let config = require('./../../../helper/config')
const Web3 = require("web3");
const web3js = new Web3(new Web3.providers.HttpProvider(config.infura.base_url));
/**
 @desc: create account
 @return: account
**/
exports.createAccount = function() {
	let newAccount = web3js.eth.accounts.create();
	return newAccount;
} 

/**
 @desc: get balances of eth and usdc in account
**/
exports.getBalances = async function(address) {
	let w_eth_balance = await web3js.eth.getBalance(address);
	w_eth_balance = w_eth_balance / 1000000000000000000;
	console.log('eth balance:================================' + w_eth_balance);

	let contract = new web3js.eth.Contract(usdcAbi, config.infura.usdc_address);
	// let w_usdc_balance = await contract.methods.balanceOf(address).call((error, balance) => {
	// 	contract.methods.decimals().call((error, decimals) => {
	// 		balance = balance / (10**decimals);
			
	// 	});
	// });     
	let w_usdc_balance = await contract.methods.balanceOf(address).call()
	let w_decimals = await contract.methods.decimals().call()
	w_usdc_balance = w_usdc_balance / (10**w_decimals);
	console.log('usdc balance:================================' + w_usdc_balance)

	return {eth: w_eth_balance, usdc: w_usdc_balance};
}

/**
 @desc: get balances of erc20 in account
**/
exports.getErc20Balances = async function(address, erc20Address) {
	let w_balance = 0;
	if(erc20Address == config.infura.usdc_address) {
		// let contract = new web3js.eth.Contract(usdcAbi, config.infura.usdc_address);
		// w_balance = await contract.methods.balanceOf(address).call()
		w_balance = 10000000;
	} else {
		// let contractERC20 = new web3js.eth.Contract(erc20Abi, erc20Address)
		// w_balance = await contractERC20.methods.balanceOf(address).call()
		w_balance = 200000000000000000000;
	}
	return w_balance;
}