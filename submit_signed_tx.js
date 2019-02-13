const Web3 = require('web3');

var web3;
if (true || process.env.APP_CONFIG === 'dev') {
    console.log("Using local ganache HTTP instance");
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
} else {
    console.log("Using Infura HTTP Provider");
    web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/' + 
                                                    process.env.infuraKey));
}

const submit = async() => {
    serializedTx = process.argv[2];
    web3.eth.sendSignedTransaction('0x' + serializedTx)
        .once('transactionHash', function(hash) { console.log("Txid " + hash); } )
        .on('error', (error) => { 
            console.error(error.message); 
        })
} 

submit();
