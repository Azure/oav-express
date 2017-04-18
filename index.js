// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

'use strict';

const oav = require('oav');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const ErrorCodes = oav.Constants.ErrorCodes;
const port = process.env.PORT || 1337;
const app = express();
var server;
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// LiveValidator configuration options
const liveValidatorOptions = {
  "git": {
    "shouldClone": true,
    "url": "https://github.com/Azure/azure-rest-api-specs.git"
  }
};
const validator = new oav.LiveValidator(liveValidatorOptions);
validator.initialize().then(() => {
  console.log("Live validator initialized.");
  server = app.listen(port, () => {
    let host = server.address().address
    let port = server.address().port

    console.log(`oav - express app listening at http://${host}:${port}`);
  });
});

app.get('/', (req, res) => {
  res.send('Welcome to oav-express');
})

// This responds a POST request for live validation
app.post('/validate', (req, res) => {
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
