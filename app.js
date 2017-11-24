const fs = require('fs');
const express = require('express')
const app = express()

// Quotes are stored in a separate json file containing a list of lists.
// The top level list contains all the quotes and each quote is a list
// of the quote itself and who it is attributed to.
var quotes = JSON.parse(fs.readFileSync(__dirname + '/public/quotes.json', 'utf8'));

// Use the public sub directory as the root for static content
app.use(express.static('public'))

// Request a random quote from the list
app.get('/random', function(req, res) { 
    var quote = quotes[Math.floor(Math.random() * quotes.length)];
    res.send(quote);
});

// Request a quote that changes every 24 hours based on server time
// The trick is to calculate the number of days since Jan 1 1970 and
// then produce the modulo of the number of quotes to get a new 
// quote every 24 hours.
app.get('/qotd', function(req, res) {
    var now = new Date();
    // One day is 86,400,000 milliseconds, i.e. 8.64e7
    var fullDaysSinceEpoch = Math.floor(now / 8.64e7);
    var quote = quotes[fullDaysSinceEpoch % quotes.length];
    res.send(quote);
});

// Start the HTTP listener
app.listen(3000, function () {
    console.log('Listening on port 3000');
});

