/*
NodeJS CMX Receiver

A basic web service to accept CMX data from a Cisco Meraki network
- Accept a GET request from Meraki and respond with a validator
- Meraki will POST to server, if validated.
- POST will contain a secret, which can be verified by the server.
- JSON data will be in the req.body.data. This will be available in the cmxData function's data object.

-- This skeleton app will only place the data received on the console. It's up to the developer to use this how ever required

*/
require("dotenv").config();
// CHANGE THESE CONFIGURATIONS to match your CMX configuration
var port = process.env.OVERRIDE_PORT || process.env.PORT || 1890;
var secret = process.env.SECRET || "enterYourSecret";
var validator = process.env.VALIDATOR || "enterYourValidator";
var route = process.env.ROUTE || "/cmx";

//**********************************************************

// Express Server
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("promisify-fs");

app.use(bodyParser.json({ limit: "25mb" }));

// CMX Location Protocol, see https://documentation.meraki.com/MR/Monitoring_and_Reporting/CMX_Analytics#API_Configuration
//
// Meraki asks for us to know the secret
app.get(route, function(req, res) {
  console.log("Validator = " + validator);
  res.status(200).send(validator);
});
//
// Getting the flow of data every 1 to 2 minutes
app.post(route, function(req, res) {
  if (req.body.secret == secret) {
    console.log("Secret verified");
    console.log(req.body);
    fs.writeFile(
      `./data/${Math.random()
        .toString(36)
        .substr(2)}.json`,
      req.body
    )
      .then(() => {
        return res.status(200).json({ data: req.body });
      })
      .catch(e => {
        console.error(e);
        return res.status(400).json({ error: e });
      });
  } else {
    res.status(401).json({ error: "incorrect secret" });
  }
  res.status(200);
});

// Start server
app.listen(port, function() {
  console.log("CMX Receiver listening on port: " + port);
});
