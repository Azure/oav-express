/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const assert = require('assert');
const should = require('should');
const request = require('request');

var server, client;
const baseUri = 'http://localhost:1337';
describe('oav-express', () => {
  before((done) => {
    server = require('../index.js');
    done();
  });
  after((done) => {
    done();
  });
  describe('basic test', () => {
    it('should should respond to /', (done) => {
      let url = 'http://localhost:1337/';
      request.get(url, (err, response, responseBody) => {
        should.not.exist(err);
        should.exist(response);
        should.exist(responseBody);
        response.statusCode.should.equal(200);
        responseBody.should.equal('Welcome to oav-express');
        done();
      });
    });

    it('should should respond to /validate for successful validation', (done) => {
      let url = 'http://localhost:1337/validate';
      const requestBody = {
        "liveRequest": {
          "rawResponse": false,
          "queryString": {},
          "url": "https://management.azure.com/subscriptions/subcriptionID/providers/Microsoft.Storage/checkNameAvailability?api-version=2016-01-01",
          "method": "POST",
          "headers": {
            "Content-Type": "application/json; charset=utf-8",
            "accept-language": "en-US",
            "x-ms-client-request-id": "81161439-5d0a-4f6c-a41d-08d20985bee7"
          },
          "body": {
            "name": "storage4db9202c66274d529",
            "type": "Microsoft.Storage/storageAccounts"
          }
        },
        "liveResponse": {
          "statusCode": "200",
          "body": {
            "nameAvailable": true
          },
          "headers": {
            "content-type": "application/json"
          }
        }
      };
      const bodyAsString = JSON.stringify(requestBody);
      let requestOptions = {
        body: bodyAsString, headers: {
          'Content-type': 'application/json'
        }
      };
      request.post(url, requestOptions, (err, response, responseBody) => {
        should.not.exist(err);
        should.exist(response);
        should.exist(responseBody);
        response.statusCode.should.equal(200);
        done();
      });
    });

    it('should should respond to /validate for validation with errors', (done) => {
      let url = 'http://localhost:1337/validate';
      let requestBody = {
        "liveRequest": {
          "rawResponse": false,
          "queryString": {},
          "url": "https://management.azure.com/subscriptions/subcriptionID/providers/Microsoft.Storage/storageAccounts?api-version=2016-01-01",
          "method": "GET",
          "headers": {
            "Content-Type": "application/json; charset=utf-8",
            "accept-language": "en-US",
            "x-ms-client-request-id": "6d5341d4-f7ce-4a50-a9b7-bf1ae6fbcfba"
          },
          "body": null
        },
        "liveResponse": {
          "statusCode": "200",
          "body": {
            "value": [
              {
                "id": "/subscriptions/<AZURE_SUBSCRIPTION_ID>/resourceGroups/vishrutrg/providers/Microsoft.Storage/storageAccounts/vishrutrg",
                "kind": "Storage",
                "location": "westus",
                "name": "vishrutrg",
                "properties": {
                  "creationTime": "2016-03-18T01:58:17.4992360Z",
                  "primaryEndpoints": {
                    "blob": "https://vishrutrg.blob.core.windows.net/",
                    "file": "https://vishrutrg.file.core.windows.net/",
                    "queue": "https://vishrutrg.queue.core.windows.net/",
                    "table": "https://vishrutrg.table.core.windows.net/"
                  },
                  "primaryLocation": "westus",
                  "provisioningState": "Succeeded",
                  "statusOfPrimary": "available"
                },
                "sku": {
                  "name": "Standard_LRS",
                  "tier": "Standard"
                },
                "tags": {},
                "type": "Microsoft.Storage/storageAccounts"
              },
              {
                "id": "/subscriptions/<AZURE_SUBSCRIPTION_ID>/resourceGroups/vishrutrg/providers/Microsoft.Storage/storageAccounts/vishrutsa",
                "kind": "Storage",
                "location": "westus",
                "name": "vishrutsa",
                "properties": {
                  "creationTime": "2016-03-16T17:21:57.7793489Z",
                  "primaryEndpoints": {
                    "blob": "https://vishrutsa.blob.core.windows.net/",
                    "file": "https://vishrutsa.file.core.windows.net/",
                    "queue": "https://vishrutsa.queue.core.windows.net/",
                    "table": "https://vishrutsa.table.core.windows.net/"
                  },
                  "primaryLocation": "westus",
                  "provisioningState": "Succeeded",
                  "statusOfPrimary": "available"
                },
                "sku": {
                  "name": "Standard_LRS",
                  "tier": "Standard"
                },
                "tags": {},
                "type": "Microsoft.Storage/storageAccounts"
              },
              {
                "id": "/subscriptions/<AZURE_SUBSCRIPTION_ID>/resourceGroups/vishrutrg/providers/Microsoft.Storage/storageAccounts/vishrutsa1",
                "kind": "Storage",
                "location": "westus",
                "name": "vishrutsa1",
                "properties": {
                  "creationTime": "2016-04-21T20:49:38.2606433Z",
                  "primaryEndpoints": {
                    "blob": "https://vishrutsa1.blob.core.windows.net/",
                    "file": "https://vishrutsa1.file.core.windows.net/",
                    "queue": "https://vishrutsa1.queue.core.windows.net/",
                    "table": "https://vishrutsa1.table.core.windows.net/"
                  },
                  "primaryLocation": "westus",
                  "provisioningState": "Succeeded",
                  "statusOfPrimary": "available"
                },
                "sku": {
                  "name": "Standard_LRS",
                  "tier": "Standard"
                },
                "tags": {},
                "type": "Microsoft.Storage/storageAccounts"
              }
            ]
          },
          "headers": {
            "content-type": "application/json"
          }
        }
      };
      const bodyAsString = JSON.stringify(requestBody);
      let requestOptions = {
        body: bodyAsString,
        headers: {
          'Content-type': 'application/json'
        }
      };
      request.post(url, requestOptions, (err, response, responseBody) => {
        should.not.exist(err);
        should.exist(response);
        should.exist(responseBody);
        response.statusCode.should.equal(200);
        done();
      });
    });
  });
});
