#!/usr/bin/env python3
import json
import requests
import sys

PK = 'cc4acdbe86a7d6e4c4e2a60cdb9cd4cea64d35e2a6e0446c0d2c1fbd5840a1da'

PK_ENCRYPTED = '56c988226eed1f0e62089af9058804104a4ac2489074dc085a0e6eeaccc63384'

UNSIGNED_TX = 'f8486c843b9aca008347e7c4943dc33fc3fe1dcfe55cbe33c7456c6f00b5ca084780a416a0368d09ded19fbaec56f35458b1558c8f7db4158948ff82fe3c2dff13f277e38dd9c81c8080'

SIGNED_TX = 'f8886c843b9aca008347e7c4943dc33fc3fe1dcfe55cbe33c7456c6f00b5ca084780a416a0368d09ded19fbaec56f35458b1558c8f7db4158948ff82fe3c2dff13f277e38dd9c81ca0f5af033d8620d01cbdab7fd00f1fa9d4a4614d6a5f52be493e3787786a37f9eaa0032107864c1637ffb6af8c8e3d47536e134a465027b2733018463e9ead2e9ba7'

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
data = {'tx': UNSIGNED_TX, 'key': PK_ENCRYPTED}
res = post('/api/sign', data);
#assert res['signedTx'] == SIGNED_TX
