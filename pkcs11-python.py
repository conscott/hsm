#!/usr/bin/env python3.6
import pkcs11
from pkcs11.constants import Attribute, ObjectClass, MechanismFlag
from pkcs11.mechanisms import KeyType, Mechanism
from pkcs11.util import ec

import os

# Initialise our PKCS#11 library
lib = pkcs11.lib(os.environ['MODULE'])

# PK_LABEL = '1234'
# OT_LABEL = 'test_key_1'
UNSIGNED = 'ec80843b9aca008347e7c494c1c5da1673935527d4efe1714ef8dcbee12a93808801589cc6877c65c0801c8080'

aes_hex = 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
aes_key = bytes.fromhex(aes_hex)


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


def import_privkey(token, label, data):
    with token.open(rw=True, user_pin=os.environ['PIN']) as session:
        pk = ec.decode_ec_private_key(data)
        pk[Attribute.LABEL] = label
        pk[Attribute.SIGN] = True
        pk[Attribute.PRIVATE] = True
        pk[Attribute.SENSITIVE] = True
        pk[Attribute.TOKEN] = True
        obj = session.create_object(pk)
        print("Should have saved pk")
        return obj


# obj = session.get_key(label=label,
#                      object_class=ObjectClass.PUBLIC_KEY,
#                      key_type=KeyType.EC)
def get_pubkey(session, label):
    for obj in session.get_objects({
            Attribute.CLASS: ObjectClass.PUBLIC_KEY,
            Attribute.LABEL: label,
    }):
        return obj


def get_privkey(session, label):
    for obj in session.get_objects({
            Attribute.CLASS: ObjectClass.PRIVATE_KEY,
            Attribute.LABEL: label,
    }):
        return obj


def get_aes(session, label):
    for obj in session.get_objects({
            Attribute.CLASS: ObjectClass.SECRET_KEY,
            Attribute.LABEL: label,
    }):
        return obj


def get_keypair(session, label):
    pk = get_privkey(session, label)
    pub = get_pubkey(session, label)
    return pub, pk


def sign_data(token, label, f):
    data = load_file_bytes(f)
    with token.open(user_pin=os.environ['PIN']) as session:
        obj = get_privkey(session, label)
        to_sign = bytes.fromhex(data)
        der_sig = obj.sign(to_sign)
        write_file_bytes('sig.der', der_sig)
        print("Signed to sig.der")


def aes_encrypt(token):
    data = b'INPUT DATA'

    # Open a session on our token
    with token.open(user_pin=os.environ['PIN']) as session:
        key = session.generate_key(pkcs11.KeyType.AES, 256)
        iv = session.generate_random(128)
        crypttext = key.encrypt(data, mechanism_param=iv)
        print("Text is %s" % crypttext)


def print_key_attributes(key):
    print("Private   %s" % key[Attribute.PRIVATE])
    print("Extract   %s" % key[Attribute.EXTRACTABLE])
    print("Sensitive %s" % key[Attribute.SENSITIVE])


def unwrap_key(session, data, aes_label):
    key = get_aes(session, aes_label)
    unwrap = key.unwrap_key(ObjectClass.PRIVATE_KEY,
                            KeyType.EC,
                            data,
                            store=False,
                            label='forgetaboutit',
                            template={
                                pkcs11.Attribute.EXTRACTABLE: True,
                                pkcs11.Attribute.SENSITIVE: False
                            })
    print("Got unwrap key %s" % unwrap.__dict__)


def export_wrap_privkey(session, label, aes_label):
    pub, pk = get_keypair(session, label)
    key = get_aes(session, aes_label)
    print("AES dict %s" % key.__dict__)
    print("Pub:  %s" % pub[Attribute.EC_POINT].hex())
    print("Priv: %s" % pk[Attribute.VALUE].hex())
    print("AES:  %s" % key[Attribute.VALUE].hex())
    wrapped_pk_bytes = key.wrap_key(pk)
    print("Got wrapped key %s" % wrapped_pk_bytes.hex())
    write_file_bytes('wrapped.pk', wrapped_pk_bytes)


def gen_aes_key(token, label, data):
    with token.open(rw=True, user_pin=os.environ['PIN']) as session:
        key = session.create_object({
            Attribute.LABEL: 'conor_4',
            Attribute.EXTRACTABLE: True,
            Attribute.SENSITIVE: False,
            pkcs11.Attribute.CLASS: pkcs11.ObjectClass.SECRET_KEY,
            pkcs11.Attribute.KEY_TYPE: pkcs11.KeyType.AES,
            pkcs11.Attribute.VALUE: aes_key
        })
        """
        key = session.create_object({
            Attribute.LABEL: bytes("%s" % label, 'utf-8'),
            Attribute.EXTRACTABLE: True,
            Attribute.SENSITIVE: False,
            Attribute.CLASS: pkcs11.ObjectClass.SECRET_KEY,
            Attribute.KEY_TYPE: pkcs11.KeyType.AES,
            Attribute.VALUE: b'This is my secret'
        })
        key = session.generate_key(
            pkcs11.KeyType.AES,
            256,
            label=label,
            id=bytes("%s" % label, 'utf-8'),
            store=True,
            mechanism=Mechanism.AES_KEY_WRAP,
            template={
                Attribute.EXTRACTABLE: True,
                Attribute.SENSITIVE: False,
                Attribute.VALUE: aes_key
            })
        """
        print("AES:  %s" % key[Attribute.VALUE].hex())
        return key


def gen_keypair(session, label='', store=False):
    pub, priv = session.generate_keypair(
            KeyType.EC,
            256,
            id=bytes("%s" % label, 'utf-8'),
            label=label,
            store=False,
            capabilities=MechanismFlag.WRAP | MechanismFlag.UNWRAP | MechanismFlag.SIGN | MechanismFlag.VERIFY | Attribute.ENCRYPT | MechanismFlag.DERIVE | Attribute.VERIFY | Attribute.DECRYPT,
            public_template={
                Attribute.EC_PARAMS: load_file_bytes('secp256k1.params'),
                Attribute.EXTRACTABLE: True,
                Attribute.SENSITIVE: False,
            },
            private_template={
                Attribute.EXTRACTABLE: True,
                Attribute.SENSITIVE: False,
            })
    return pub, priv


def gen_wrapped_key(token, aes_label):
    with token.open(user_pin=os.environ['PIN']) as session:
        pub, pk = gen_keypair(session, store=False)
        #print("Pub:  %s" % pub[Attribute.EC_POINT].hex())
        #print("Priv: %s" % pk[Attribute.VALUE].hex())
        key = get_aes(session, aes_label)
        print("AES:  %s" % key[Attribute.VALUE].hex())
        wrapped_pk_bytes = key.wrap_key(pk)
        print("Got wrapped key %s" % wrapped_pk_bytes.hex())


slot = lib.get_slots()[0]
token = slot.get_token()

with token.open(rw=True, user_pin=os.environ['PIN']) as session:
    # key = gen_aes_key(token, 'conor_again_3', aes_key)
    # gen_keypair(token, 'my_label_2')
    # gen_wrapped_key(token, 'my_aes')
    export_wrap_privkey(session, 'my_label_2', 'my_aes')
