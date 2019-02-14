btc = require('bitcoinjs-lib');
var KeyEncoder = require('key-encoder'),
    keyEncoder = new KeyEncoder('secp256k1')
lib = require('./sign_lib.js');

let rawtxstr = process.argv[2];
let keypair = btc.ECPair.fromWIF('cN1VyRFTMAZJNrEm1Xerp5iSn53yLBQM3A42QkvUr2PoVELZLxJx', btc.networks.regtest)
let rawtx = new Buffer(rawtxstr, 'hex');
let tx = new btc.Transaction.fromBuffer(rawtx);
let tb = new btc.TransactionBuilder.fromTransaction(tx, btc.networks.regtest)

//tb.sign(0, keypair);
//console.log(tb.build().toHex());
//process.exit();

let vin = 0;
let hashType = btc.Transaction.SIGHASH_ALL
const input = tb.__inputs[vin]
const ourPubKey = keypair.publicKey || keypair.getPublicKey()
const prepared = tb.makeInput(input, ourPubKey);
Object.assign(input, prepared)
let signatureHash
if (input.hasWitness) {
  signatureHash = tb.__tx.hashForWitnessV0(vin, input.signScript, input.value, hashType)
} else {
  signatureHash = tb.__tx.hashForSignature(vin, input.signScript, hashType)
}
console.log("SigHash " + signatureHash.toString('hex'));

let hsm = true;
if (hsm) {
  lib.signMsg(signatureHash.toString('hex'), 9999).then((signature) => {
    //console.log("Sig " + signature.toString('hex'));
    console.log("Verify is " + keypair.verify(signatureHash, signature));
    input.signatures[0] = btc.script.signature.encode(signature, hashType)
    console.log(tb.build().toHex());
  });
} else {
  const signature = keypair.sign(signatureHash)
  input.signatures[0] = btc.script.signature.encode(signature, hashType)
  console.log(tb.build().toHex());
}
