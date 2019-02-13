#!/usr/bin/env python3
import json
import requests
import sys

UNSIGNED_TX = 'f8486c843b9aca008347e7c4943dc33fc3fe1dcfe55cbe33c7456c6f00b5ca084780a416a0368d09ded19fbaec56f35458b1558c8f7db4158948ff82fe3c2dff13f277e38dd9c81c8080'

host = 'http://localhost:8090'
headers = {'Content-Type': 'application/json'}

def post(url, data):
    print("\nPOST %s\n%s" % (host + url, json.dumps(data, indent=4)))
    res = requests.post(host + url, data=json.dumps(data), headers=headers)
    print("\nResponse\n%s" % json.dumps(res.json(), indent=4))
    assert res.status_code is 200
    return res.json()

def get(url):
    print("\nGET %s" % (host + url))
    res = requests.get(host + url)
    print("\nResponse\n%s" % json.dumps(res.json(), indent=4))
    assert res.status_code is 200
    return res.json()

"""
# First make sure we can encrypt / decrypt the private key properly
res = get('/api/encrypt?data=%s' % PK);
assert res['encrypted'] == PK_ENCRYPTED;
res = get('/api/decrypt?data=%s' % res['encrypted']);
assert res['decrypted'] == PK;
"""

# Now try to sign a raw transaction
data = {'rawTx': UNSIGNED_TX, 'account': 'backed'}
res = post('/api/sign', data);
#assert res['signedTx'] == SIGNED_TX
