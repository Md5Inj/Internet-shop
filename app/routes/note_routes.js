var ObjectID = require('mongodb').ObjectID;
const settingsId = "5a288d0a5b6f7c13bc3eaf78";

module.exports = function(app, db) {
  app.get('/settings', (req, res) => {
    var text = db.collection('settings').find();
    var a = {};
    var i = 0;
    text.each((err, doc) => {
      if (doc != null) {
        a[i] = doc;
        i++;
      } else {
        res.send(a);
      }
    });
  });

  app.put("/settings/update/:operation", function(req, res) {
    const details = { "_id": new ObjectID(settingsId)};
    db.collection('settings').update(details, {$set: { title: req.body.title}});
    res.send("OK");
  });

  app.post("/register", function(req, res) {    
    db.collection('users').findOne({"login": req.body.login}, (err, item) => {
      if (err) console.log(err) 
        else if (item == null) {
            db.collection('users').insert({
              "login": req.body.login,
              "password": req.body.password,
              "haveAdminRights": req.body.haveAdminRights,
              "date": new Date(Date.now()).toLocaleString().split(",")[0],
              "fio": "",
              "address": "",
              "phone": ""
          }, (err, result) => {
            if (err) console.log(err);
            db.collection('basket').insert({
              "confirmed": false,
              "userID": result.insertedIds[0],
              "date": new Date(Date.now()).toLocaleString().split(",")[0]
            }, function(error, resultat) {
              if (error) console.log(error);
              res.send("OK");
            });
          });
        }
        else {
          res.send("Error: user already exists");
        }
    });
  });

  app.post("/login", function(req, res) {
    if (req.session.user) return res.redirect('/');
    db.collection('users').findOne({
      "login": req.body.login,
      "password": req.body.password
    }, (err, item) => {
      if (err) console.log(err);
      if (item != null) 
      {
        req.session.user = {id: item._id, name: item.login }
        res.send("logged");
      }
        else res.send("invalid login or password");
    })
  });  

  app.get("/", function(req, res, next) {
    if(req.session.user){
    var data = {
      title: 'Express',
      user : req.session.user
    }
    res.send("ok");
    res.render('index', data);
  } else {
    var data = {
        title: 'Express',
    }
    res.render('index', data);
  }
  });

  app.get("/getUser", function(req, res) {
    var s = req.cookies["connect.sid"];
    if (s != undefined)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        var obj = JSON.parse(result[0].session);
        res.send(obj.user.name);
      });
    } else {
      res.send("Not logged");
    }
  });

  app.get("/userIsAdmin", function(req, res) {
    var s = req.cookies["connect.sid"];
    if (s)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          if (err) console.log(err);
          res.send(item.haveAdminRights);
        });
      });
    } else {
      res.send("Not logged");
    }    
  });

  app.get("/getID", function(req, res) {
    var s = req.cookies["connect.sid"];
    if (s != undefined)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          if (err) console.log(err);
          var id = item._id.toString().replace(/"/g, "");
          res.send(id);
        });
      });
    } else {
      res.send("Not logged");
    }    
  });

  app.get("/getUserRecord", function(req, res) {
    var s = req.cookies["connect.sid"];
    if (s != undefined)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          res.send(JSON.stringify(item));
        });
      });
    } else {
      res.send("Not logged");
    }    
  });

  app.get("/logout", function(req, res) {
    if (req.cookies["connect.sid"])
    {
      res.clearCookie("connect.sid");
      res.redirect('/')
    }
  });

  app.post("/updateUserInfo", function(req, res) {
    var s = req.cookies["connect.sid"];
    if (s != undefined)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          if (err) console.log(err);
          var id = item._id.toString().replace(/"/g, "");
          console.log(id);
          db.collection('users').update({"login": JSON.parse(result[0].session).user.name}, {
            login: req.body.login,
            password: req.body.password,
            date: item.date,
            fio: req.body.fio,
            address: req.body.address,
            phone:req.body.phone,
            haveAdminRights: item.haveAdminRights
          }, function(err) {
            if (err) console.log(err);
            res.send("OK");
          });
        });
      });
    } else {
      res.send("Not logged");
    } 
  });

  app.post("/addItem", function(req, res) {
    var s = req.cookies["connect.sid"];
    if (s)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          if (err) console.log(err);
          if (item.haveAdminRights) {
            db.collection('items').insert({
              name: req.body.name,
              characteristics: req.body.charact,
              price: req.body.price,
              imageURL: req.body.imageURL,
              categoryId: req.body.categoryId
            }, function(err, result) {
              if (err) console.log(err);
              res.send("OK");
            });
          }
        });
      });
    } else {
      res.send("Not logged");
    }   
  });

  app.post("/addCategory", function(req, res) {
    var s = req.cookies["connect.sid"];
    if (s)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          if (err) console.log(err);
          if (item.haveAdminRights) {
            console.log("ok");
            db.collection('categories').insert({
              name: req.body.name,
              description: req.body.descr
            }, function(err, result) {
              if (err) console.log(err);
              res.send("OK");
            });
          }
        });
      });
    } else {
      res.send("Not logged");
    }   
  });

  app.get("/getCategories", function(req, res) {
    db.collection('categories').find({}).toArray(function(err, result) {
      res.send(result);
    });
  });

  app.get("/getGoods", function(req, res) {
    db.collection('items').find({}).toArray(function(err, result) {
      res.send(result);
    });
  });

  app.post("/getItem", function(req, res) {
    db.collection('items').findOne({_id: new ObjectID(req.body.id)}, function(err, item) {
      if (err) console.log(err);
      res.send(item);
    });
  });

  app.get("/getBasketID", function(req, res) {
    var s = req.cookies["connect.sid"];
    if (s)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          if (err) console.log(err);
          db.collection('basket').findOne({"userID": item._id}, function(err, r) {
            res.send(r._id.toString().replace(/"/g, ""));
          });
        });
      });
    }
  });

  app.post("/addToBasket", function(req, res) {
    var s = req.cookies["connect.sid"];
    if (s)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          db.collection('goodInBasket').insert({
            "count": req.body.count,
            "goodID": req.body.goodID,
            "basketID": req.body.basketID
          }, function(err, response) {
            if (err) console.log(err);
              res.send("OK");
          });
        });
      });
    }
  });

  app.get("/getItemsInBasket", function(req, res) {
    var s = req.cookies["connect.sid"];
    var bID;
    if (s)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          if (err) console.log(err);
          db.collection('basket').findOne({"userID": item._id}, function(err, r) {
            bID = r._id.toString().replace(/"/g, ""); // ID of basket
            db.collection('goodInBasket').find({"basketID": bID}).toArray(function(error, resultat) {
              if (error) console.log(error);
              res.send(resultat);
            });
          });
        });
      });
    } else {
      res.send("Not logged");
    }
  });

  app.post("/removeItemFromBasket", function(req, res) {
    var s = req.cookies["connect.sid"];
    var bID;
    if (s)
    {
      s = s.split("s:")[1].split(".")[0];
      db.collection('sessions').find({"_id" : s}).toArray(function(err, result) {
        if (err) console.log(err);
        db.collection('users').findOne({"login": JSON.parse(result[0].session).user.name}, function(err, item) {
          if (err) console.log(err);
          console.log("OK");
          db.collection('basket').findOne({"userID": item._id}, function(err, r) {
            bID = r._id.toString().replace(/"/g, ""); // ID of basket
            db.collection('goodInBasket').find({"basketID": bID}).toArray(function(error, resultat) {
              if (error) console.log(error);
              for (var i = 0; i < resultat.length; i++) {
                if (req.body.goodID ==  resultat[i].goodID && bID == resultat[i].basketID) {
                  db.collection('goodInBasket').remove({"goodID": req.body.goodID}, function(err) {
                    if (err) console.log(err);
                    res.send("OK");
                  });
                }
              }
            });
          });
        });
      });
    }
  });

}