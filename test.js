const { ethers } = require('ethers');
const config = require('./helper/config');
const minterAbi = require('./abi/minter.json');
const collectionAbi = require('./abi/collection.json');

const public_key = '0x95cF077530f02EBE2Df0c0BDaAd87E64C58129ee';
const private_key = '0x3f34d9d333838dcd2479599b01a1a7fa813188adc94b373235022402182c9962';


async function run() {
    //const infuraProvider = new ethers.providers.InfuraProvider('ropsten', config.infura.projectID);
    const provider = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
    const wallet = new ethers.Wallet(private_key, provider);
    const signer = wallet.connect(provider);
    
    let contract = new ethers.Contract(config.infura.collection_address, minterAbi, signer);
    
    try {
        let tx = await contract.createPrivateCollection("badf111111", "fdsafj", public_key, options);
        let res = await tx.wait();
        // console.log(res);
         let res2 = await contract.getCollectionAddress();
         console.log(res2);
    } catch(e) {
        console.log(e);
    }

   let collection_address = '0x05979869c12a868b36C94d15A4029A49f01Ef1B6';
    let contract = new ethers.Contract(collection_address, collectionAbi, signer);
    let nonce = await signer.getTransactionCount('latest', 'pending')

    let options = {
        gasLimit: 3000000,
        nonce: nonce,
        value: 0    
    };
    try {
        let tx = await contract.mint("badf1111fd11", public_key, options);
        let res = await tx.wait();
        
         let res2 = await contract.totalSupply();
         console.log(res2);
    } catch(e) {
        console.log(e);
    }
}

(async() => {
    run();
})()
/*
    const wallet = new ethers.Wallet(private_key, infuraProvider);
    const signer = wallet.connect(infuraProvider);



    console.log(name, symbol);

    console.log(contract);
    // Call the contract, getting back the transaction
    try {
        let tx = await contract.createPrivateCollection(name, symbol, public_key, options);

        */
