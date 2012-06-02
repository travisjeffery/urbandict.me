
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , request = require('request')
  , jsdom = require('jsdom')
  , _ = require('underscore')._

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get("/", function(req, res, next){
  res.render('index')
})

app.get("/api/:term", function(req, res, next){
  request("http://www.urbandictionary.com/define.php?term=" + escape(req.params.term), function(error, response, body){
    if (error) return error

    jsdom.env({
      html: body,
      scripts: [
        'http://code.jquery.com/jquery.min.js'
      ]
    }, function(err, window){
      var $ = window.jQuery
      var entries = $("#entries tr")
      , evenEntries = entries.filter(":even")
      , oddEntries = entries.filter(":odd")
      , word = entries.filter(":even:first").find(".word").text().trim()
      , definition = entries.filter(":odd:first").find(".definition").text().trim()
      , example = entries.filter(":odd:first").find(".example").text().trim()

      var data = _.range(3).map(function(index){
        return {
            word: evenEntries.eq(index).find(".word").text().trim()
          , definition: oddEntries.eq(index).find(".definition").text().trim()
          , example: oddEntries.eq(index).find(".example").text().trim()
        }
      })

      res.send(JSON.stringify({ entries: data }))
    })
  })  
})

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
