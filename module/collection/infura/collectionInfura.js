/*
Project : Cryptotrades
FileName : userInfura.js
Author : LinkWell
File Created : 11/10/2021
CopyRights : LinkWell
Purpose : This is the file which used to define all user related infura api function.
*/
let minterAbi = require('../../../abi/minter.json')
const { ethers } = require('ethers')
const config = require('../../../helper/config')


/**
 @desc: create a collection
**/
exports.createCollection = async function(public_key, private_key, name, symbol) {
    let w_result = '';
    const infuraProvider = new ethers.providers.InfuraProvider('ropsten', config.infura.projectID);
    const wallet = new ethers.Wallet(private_key, infuraProvider);
    const signer = wallet.connect(infuraProvider);

    let contract = new ethers.Contract(config.infura.collection_address, minterAbi, signer);
    let nonce = await signer.getTransactionCount('latest', 'pending')

    let options = {
        gasLimit: 3000000,
        nonce: nonce,
        value: 0    
    };
    // Call the contract, getting back the transaction
    try {
        let tx = await contract.createPrivateCollection(name, symbol, public_key, options);       
        let rc = await tx.wait();
        const event = rc.events.find(event => event.event === 'NewCollection');
        const [collectionAddr, to] = event.args;
        w_result = collectionAddr;
        console.log(w_result);
    } catch(e) {
        console.log(e)
    }

	return w_result;
}
