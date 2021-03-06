/*
 * interact_counter
 *    Interact with deployed counter contract
 *    node interact_counter.js {contractAddress}
 */


const fs = require("fs");
const rp = require("request-promise");
const Accounts = require("aion-keystore");

// directory where Web3 is stored, in Aion Kernel
global.Web3 = require('aion-web3');
// connecting to Aion local node
const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.201:8545"));

// Importing unlock, compile and deploy scripts
// const unlock = require('./scripts/unlock.js')
const compile = require('./contracts/compile.js');
const deploy = require('./contracts/deploy.js');
const readlineSync = require('readline-sync')

// Importing unlock, compile and deploy scripts
const sol = fs.readFileSync('./contracts/Counter.sol', {
  encoding: 'utf8'
});

const contractAddr = process.argv[2] // Contract Address
let contractInstance; //
let privateKey =
  "0x5746bd483659b19d37a0724925972536b9625be0deb91f72550ab4fa403154920a984f798a95d1f45b6f31f0b15e00d993466036fe0c39962a69cc2bb3006b47";
const account = new Accounts();
const acc = account.privateKeyToAccount(privateKey);;
; // Grab your account index at [i]
let pw0 = "AccountPasswordGoesHere"; // Account password associated w/ a0
//not needed when dapp provides 
Promise.all([
  // Unlock accounts & complile contract
  compile(web3, sol),
  //   console.log("\n[log] 1. unlocking account:", a0),
  console.log("[log] 2. compiling contract"),

]).then((res) => {
  let a0 = '0xa0aa6d40d962ef60d6c42da54adec24f242de46f27d2ea3d96f0ccefa5678b62'; // Store Account
  let abi = res[0].Counter.info.abiDefinition; // abi comes from dapp 
  let code = res[0].Counter.code; // bytecode comes from dapp 
  console.log("[log] accessing contract\n");

  // Contract Instantiantion
  contractInstance = web3.eth.contract(abi).at(contractAddr);

  const contractObj = web3.eth.contract(abi);
  

  const data = contractInstance.incrementCounter.getData();
  const nonce = web3.eth.getTransactionCount(acc.address);

  // Start console
    // return count
      let count = contractInstance.getCount();
      console.log("counter =", count.toString(), "\n");
  


    // increment counter by 1



      // acc.signTransaction(contractInstance.incrementCounter().getData()).then(data => { console.log(data) });
      let estimate = web3.eth.estimateGas({ data: data });
        console.log(estimate);
      console.log('data=>', data);
      console.log('acc=>', acc);
      const tx = {
        to: contractAddr,
        data,
        gasPrice: 10000000000,
        gas: estimate,
        nonce: nonce,
        timestamp: Date.now() * 1000
      }
      
      acc.signTransaction(tx).then((signed) => {
        console.log('here');
        console.log(`signed ${JSON.stringify(signed)}`);
        const body = {
          jsonrpc: "2.0",
          method: "eth_sendRawTransaction",
          params: [signed.rawTransaction],
          id: 1
        };
        rp({
          method: "POST",
          uri: "http://192.168.1.201:8545",
          body,
          json: true
        })
        .then(response => {
          console.log("txHash " + JSON.stringify(response.result));
          console.log("submitted");
        })
        
      })
    
    // decrement counter by 1

  
});
