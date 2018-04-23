const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./app/config/db');
const session        = require('express-session');
const MongoStore     = require('connect-mongo')(session);
const cookieParser   = require('cookie-parser')
const app            = express();
const port = 8000;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./site'));
app.use(session({
  secret: 'i need more beers',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ 
    url: 'mongodb://md5inj:Tomorrowmc1@ds131546.mlab.com:31546/ishop',
  })
}))


MongoClient.connect(db.dataUrl, (err, database) => {
  if (err) return console.log(err)
  require('./app/routes')(app, database);
	app.listen(port, () => {
    console.log('We are live  ' + port);
  });               
})