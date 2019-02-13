import pkcs11
from pkcs11.constants import Attribute, ObjectClass
from pkcs11.mechanisms import KeyType
from pkcs11.util import ec

import binascii
import json
import os
import sys

# Initialise our PKCS#11 library
lib = pkcs11.lib(os.environ['MODULE'])

PK_LABEL = '1234'
#OT_LABEL = 'test_key_1'
UNSIGNED = 'ec80843b9aca008347e7c494c1c5da1673935527d4efe1714ef8dcbee12a93808801589cc6877c65c0801c8080'


def load_file_bytes(f):
    with open(f, 'rb') as fp:
        data = fp.read()
    return data


def write_file_bytes(f, b):
    with open(f, 'wb') as fp:
        fp.write(b)


def int_to_bytes(x):
    return x.to_bytes((x.bit_length() + 7) // 8, 'big')


def int_from_bytes(xbytes):
    return int.from_bytes(xbytes, 'big')


def import_privkey(token, label):
    with token.open(rw=True, user_pin=os.environ['PIN']) as session:
        pk = ec.decode_ec_private_key(data)
        pk[Attribute.LABEL] = label
        pk[Attribute.SIGN] = True
        pk[Attribute.PRIVATE] = True
        pk[Attribute.SENSITIVE] = True
        pk[Attribute.TOKEN] = True
        obj = session.create_object(pk)
        print("Should have saved pk")


# obj = session.get_key(label=label,
#                      object_class=ObjectClass.PUBLIC_KEY,
#                      key_type=KeyType.EC)
def get_pubkey(token, label):
    with token.open(user_pin=os.environ['PIN']) as session:
        for obj in session.get_objects({
                Attribute.CLASS: ObjectClass.PUBLIC_KEY,
                Attribute.LABEL: label,
        }):
            pk_bytes = ec.encode_ec_public_key(obj)
            print(binascii.hexlify(pk_bytes))
            write_file_bytes('pubkey.der', pk_bytes)

def get_privkey(session, label):
    for obj in session.get_objects({
            Attribute.CLASS: ObjectClass.PRIVATE_KEY,
            Attribute.LABEL: label,
    }):
        print("Got Private Key %s" % obj)
        return obj

def sign_data(token, label, f):
    data = load_file_bytes(f)
    with token.open(user_pin=os.environ['PIN']) as session:
        obj = get_privkey(session, label)
        to_sign = bytes.fromhex(UNSIGNED)
        der_sig = obj.sign(to_sign)
        write_file_bytes('sig.der', der_sig)
        print("Signed to sig.der")

def aes_encrypt(token):
    data = b'INPUT DATA'

    # Open a session on our token
    with token.open(user_pin=os.environ['PIN']) as session:
        # Generate an AES key in this session
        key = session.generate_key(pkcs11.KeyType.AES, 256)
        print("Got key %s" % key)
        # Get an initialisation vector
        iv = session.generate_random(128)
        print("Got iv %s" % iv)
        # Encrypt our data
        crypttext = key.encrypt(data, mechanism_param=iv)
        print("Text is %s" % crypttext)


slot = lib.get_slots()[0]
token = slot.get_token()

#import_privkey(token, 'key.der', PK_LABEL)
get_pubkey(token, PK_LABEL)
#sign_data(token, PK_LABEL, 'key.der')
