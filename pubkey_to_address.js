var eu = require('ethereumjs-util')

var uncompressed_public_key_hex = process.argv[2]
var upk_buf = new Buffer(uncompressed_public_key_hex, 'hex')
var addr_buf = eu.pubToAddress(upk_buf)
var addr = addr_buf.toString('hex')
console.log("addr: " + eu.toChecksumAddress(addr) )
