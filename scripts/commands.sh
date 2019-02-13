export PIN="PRIMUSDEV"
export MODULE="/usr/local/primus/lib/libprimusP11.so"

# Make bitcoin key
pkcs11-tool --module $MODULE -l -p $PIN --keypairgen --key-type EC:secp256k1 --id=1 --label 1

# Sign data with key
pkcs11-tool -p $PIN --module $MODULE --sign -m ECDSA --id=1 --input-file sign-in.txt | head -c 32 > data.sig

# Write der formatted object to hsm
pkcs11-tool -l -p $PIN --module $MODULE --write-object ./key.der --type pubkey --id 777
pkcs11-tool -l -p $PIN --module $MODULE --write-object ./key.der --type privkey --id 777

# List objects
pkcs11-tool --module $MODULE -l -p $PIN --list-objects
