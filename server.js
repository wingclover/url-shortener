// server.js
// where your node app starts

// init project
var express = require('express');
//require/import the mongodb native drivers.
var mongodb = require('mongodb');
var async = require('async');
var url = require('url');
var app = express();
var uri = process.env.MONGOLAB_URI;

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));



app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.get("/new/*", function (request, response) {
  var result = {"error":"Wrong url format, make sure you have a valid protocol and real site."};
  var origin_link = url.parse(request.url,true).pathname.slice(5);
  // var re = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
  var re = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  if (re.test(origin_link)){//if url is valid
    console.log("valid url");
    MongoClient.connect(uri, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('Connection established to', uri);
        var uid;  

        // do some work here with the database.
        async.forever(
          function(next) {
            uid = Math.floor(Math.random()*100000);
            db.collection('shorturl').findOne({"short": uid}).then(function (foundGroup) {
              
              if (! foundGroup) {
                console.log("record not found");
                console.log("uid", uid);
                next(uid); // break forever loop with empty error message and the key
              }
              else {
                return next() //continue loop
              }
            }).catch(function (err) {
              next(err); //break loop
              return response.send(500);
            });
          },
          function(uid){           
            result = {"original_url":origin_link,"short_url":"https://elderly-roadway.glitch.me/"+uid.toString()};
            response.send(result);
          }
        );// end of forever
        
        db.collection('shorturl').insert({"short": uid, "original_url":origin_link});        
      }//end of connection established without error
      
      //Close connection
      db.close();
      
    })//end of mongoclient.connect
    
  }//end of if url is valid
  else {
    response.send(result);
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/:num", function (request, response) {
  
    // Use connect method to connect to the Server
    MongoClient.connect(uri, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('Connection established to', uri);
        db.collection('shorturl').findOne({"short": Number(request.params.num)}).then(function(data){
          if (data){
            return response.redirect(data.original_url);
          }
          else {
            response.send({"error":"This url is not on the database."});
          }
        })
        db.close();
      }
    })
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
