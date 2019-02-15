#!/bin/bash

export PIN="PRIMUSDEV"
export MODULE="/usr/local/primus/lib/libprimusP11.so"

# Creat base accounts needed for cache coin
pkcs11-tool --module $MODULE -l -p $PIN --keypairgen --key-type EC:secp256k1 --id=1111 --label owner
pkcs11-tool --module $MODULE -l -p $PIN --keypairgen --key-type EC:secp256k1 --id=2222 --label backed
pkcs11-tool --module $MODULE -l -p $PIN --keypairgen --key-type EC:secp256k1 --id=3333 --label unbacked
pkcs11-tool --module $MODULE -l -p $PIN --keypairgen --key-type EC:secp256k1 --id=4444 --label fee
pkcs11-tool --module $MODULE -l -p $PIN --keypairgen --key-type EC:secp256k1 --id=5555 --label redeem
pkcs11-tool --module $MODULE -l -p $PIN --keypairgen --key-type EC:secp256k1 --id=6666 --label oracle
pkcs11-tool --module $MODULE -l -p $PIN --keypairgen --key-type EC:secp256k1 --id=8888 --label gramchain
