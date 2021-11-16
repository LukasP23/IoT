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
      "Order by published_at DESC \n" +
        "Limit 1 ",

    function (err, result, fields) {
      if (err) throw err;

      const temperature = result[0].temperature;
      const time = "'" + result[0].published_at + "'";

      const latitudeTBC = "5554.4547";
      //result[0].latitude;
      const NS = "N";
      //result[0].northSouth;
      const lat1 = latitudeTBC.slice(0, 2);
      const lat2 = (latitudeTBC.slice(2))/60;
      latitude = parseFloat(lat1) + parseFloat(lat2);
      if (NS == "S")
      {
        latitude = -latitude;
      }
    
      const longitudeTBC = "339.1669";
      //result[0].longitude;
      const EW = "W";
      //result[0].eastWest;
      const long1 = longitudeTBC.slice(0, 1);
      const long2 = (longitudeTBC.slice(1))/60;
      longitude = parseFloat(long1) + parseFloat(long2);
      if (EW == "W")
      {
        longitude = -longitude;
      }
    

      console.log(result);

      response.json({ temperature, latitude, longitude, time });
    }
  );
});