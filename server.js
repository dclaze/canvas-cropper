var express = require('express');
var app = express();

app.use(express.static(__dirname));

var port = 34342;

app.listen(port);

console.log("Started sever on port", port);
