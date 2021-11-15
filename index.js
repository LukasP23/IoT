const express = require("express");
const app = express();
app.listen(3000, () => console.log("listening at 3000"));

app.use(express.static("public"));

const mysql = require("mysql");
const fs = require("fs");
var con = mysql.createConnection({
  host: "34.123.88.230",
  user: "root",
  password: "Password123",
  database: "sensorDatabase",
  ssl: {
    ca: fs.readFileSync(__dirname + "/dbKeys/server-ca.pem"),
    key: fs.readFileSync(__dirname + "/dbKeys/client-key.pem"),
    cert: fs.readFileSync(__dirname + "/dbKeys/client-cert.pem"),
  },
});

con.connect(function (err) {
  if (err) throw err;
});

app.get("/location", (request, response) => {
  con.query(
    "SELECT * FROM data \n " +
      "Limit 1 ",

    function (err, result, fields) {
      if (err) throw err;

      const latitude = result[0].latitude;
      const longitude = result[0].longitude;

      response.json({ latitude, longitude });
    }
  );
});