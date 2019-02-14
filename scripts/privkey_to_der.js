btc = require('bitcoinjs-lib');
var KeyEncoder = require('key-encoder'),
    keyEncoder = new KeyEncoder('secp256k1')
let keypair = btc.ECPair.fromWIF('cN1VyRFTMAZJNrEm1Xerp5iSn53yLBQM3A42QkvUr2PoVELZLxJx', btc.networks.regtest)
let privKey = keypair.__d.toString('hex');
var derPrivateKey = keyEncoder.encodePrivate(privKey, 'raw', 'der')
console.log(derPrivateKey);
