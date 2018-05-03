var csv = require('csv-parser')
var fs = require('fs')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

function connect() {
  return new Promise(resolve => {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("quotes");
      dbo.collection("quotes").drop((err, res) => {
        if(err) {
          console.log("Warning: ", err);
        }
        dbo.createCollection("quotes", function (err, res) {
          if (err) throw err;
          resolve(db);
        });
      });
    });
  });
}

async function process() {
  console.log("Connecting to database and creating collection")
  var db = await connect();
  console.log("Processing file");
  var result = await processFile(db);
  console.log("Closing connection");
  db.close();
}


function processFile(db) {
  console.log(db);
  var dbo = db.db("quotes");
  return new Promise(resolve => {
    console.log("dbo", dbo);
    fs.createReadStream('public/author-quote.txt')
      .pipe(csv({
        raw: false,     // do not decode to utf-8 strings
        separator: '\t', // specify optional cell separator
        quote: '"',     // specify optional quote character
        escape: '"',    // specify optional escape character (defaults to quote value)
        newline: '\n',  // specify a newline character
        headers: ['NAME', 'QUOTE'] // Specifing the headers
      }))
      .on('data', function (data) {
        var myobj = { name: data.NAME, quote: data.QUOTE };
        dbo.collection("quotes").insertOne(myobj, function (err, res) {
          if (err) throw err;
          console.log("1 document inserted");
        });
        //console.log('Name: %s Qoute: %s', data.NAME, data.QUOTE)
      })
      .on('finish', () => {
        console.log("Processing complete")
        resolve("Done");
      })
  });
}

process();