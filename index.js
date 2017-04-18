// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

'use strict';

var oav = require('oav');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');

var ErrorCodes = oav.Constants.ErrorCodes;
var port = process.env.PORT || 1337;
var server;
var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// LiveValidator configuration options
let options = {
  "git": {
    "shouldClone": true,
    "url": "https://github.com/Azure/azure-rest-api-specs.git"
  }
};
const validator = new oav.LiveValidator(options);
validator.initialize().then(() => {
  console.log("Live validator initialized.");
  server = app.listen(port, () => {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port);
  });
});

app.get('/', function (req, res) {
  res.send('Welcome to oav-express');
})

// This responds a POST request for live validation
app.post('/validate', function (req, res) {
  let validationResult = validator.validateLiveRequestResponse(req.body);

  // Something went wrong
  if (validationResult && validationResult.errors && Array.isArray(validationResult.errors) && validationResult.errors.length) {
    let errors = validationResult.errors;
    let is400 = errors.some((error) => { return error.code === ErrorCodes.IncorrectInput });
    if (is400) {
      // Return 400 with validationResult
      return res.send(400, validationResult);
    }
  }

  // Return 200 with validationResult
  return res.send(validationResult);
});
