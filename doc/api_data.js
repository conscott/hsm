define({ "api": [
  {
    "type": "get",
    "url": "/api/decrypt?data=dataToEncrypt",
    "title": "Decrypt Data",
    "group": "Public",
    "name": "DecryptData",
    "description": "<p>Can be used AES decrypt the input encrypted hex data string</p>",
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl http://localhost:8090/api/decrypt?data=a332e12403944ff84aaac0a7393790a3a60e3372c4031352ffb45ee7555df339",
        "type": "curl"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data",
            "description": "<p>The hex data string to encrypt</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "decrypted",
            "description": "<p>The decrypted hex data string</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"decrypted\": \"d3799c52ee2f4f1c13bf7975ddcdeb6f94127d566fa270a25e36cf30bdfefddc\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unknown",
            "description": "<p>Possible decryption problems</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request Error\n{\n  \"error\": {\"The error reason\"}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "Public"
  },
  {
    "type": "get",
    "url": "/api/encrypt?data=dataToEncrypt",
    "title": "Encrypt Data",
    "group": "Public",
    "name": "EncryptData",
    "description": "<p>Can be used to AES encrypt the input hex data string</p>",
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl http://localhost:8090/api/encrypt?data=d3799c52ee2f4f1c13bf7975ddcdeb6f94127d566fa270a25e36cf30bdfefddc",
        "type": "curl"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data",
            "description": "<p>The hex data string to encrypt</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "encrypted",
            "description": "<p>The encrypted hex data string</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"encrypted\": \"a332e12403944ff84aaac0a7393790a3a60e3372c4031352ffb45ee7555df339\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unknown",
            "description": "<p>Possible encryption problems</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request Error\n{\n  \"error\": {\"The error reason\"}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "Public"
  },
  {
    "type": "post",
    "url": "/api/sign",
    "title": "Sign Raw Transaction",
    "group": "Public",
    "name": "SignTransaction",
    "description": "<p>Sign a raw transaction string with the encrypted private key</p>",
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -d '{\"tx\" : \"f8486c843b9aca008347e7c4943dc33fc3fe1dcfe55cbe33c7456c6f00b5ca084780a416a0368d09ded19fbaec56f35458b1558c8f7db4158948ff82fe3c2dff13f277e38dd9c81c8080\", \"key\": \"a332e12403944ff84aaac0a7393790a3a60e3372c4031352ffb45ee7555df339\"}' -H \"Content-Type: application/json\" -X POST http://localhost:8090/api/sign",
        "type": "curl"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "tx",
            "description": "<p>The raw transaction string</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "key",
            "description": "<p>The AES encrypted private key</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "signedTx",
            "description": "<p>The raw signed transaction string</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"signedTx\": \"f8886c843b9aca008347e7c4943dc33fc3fe1dcfe55cbe33c7456c6f00b5ca084780a416a0368d09ded19fbaec56f35458b1558c8f7db4158948ff82fe3c2dff13f277e38dd9c81ba070fe71539541a941b4d2a06441e4f62547f2fcd6592918db3e1a3593e37bc200a0434232f174218f35fd99ce37427b61fc2f740b25a66bf5ac70637876986b2d83\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Unknown",
            "description": "<p>sign errors</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request Error\n{\n  \"error\": {\"The error reason\"}\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./app.js",
    "groupTitle": "Public"
  }
] });
