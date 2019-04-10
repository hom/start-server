// Example express application adding the parse-server module to expose Parse
// compatible API routes.
let env = require('dotenv').config();
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

let api = new ParseServer({
  databaseURI: process.env.DATABASE_URI,
  cloud: process.env.CLOUD_CODE_MAIN,
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
  javascriptKey: process.env.JAVASCRIPT_KEY,
  restAPIKey: process.env.REST_API_KEY,
  serverURL: process.env.SERVER_URL + process.env.PARSE_MOUNT,  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"],// List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

var port = process.env.PARSE_PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('start server is running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
