
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.get('/favicon.ico', (req, res) => res.status(204).end());
mongoose.connect("mongodb+srv://admin-Abdallah:Abdallah92@cluster0.o8mpl.mongodb.net/todolistDB");

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name : "Buy Food"
});

const item2 = new Item ({
  name : "Cook Food"
});

const item3 = new Item ({
  name : "Eat Food"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List  = new mongoose.model("List", listSchema);


app.get("/", function(req, res) {
// const day = date.getDate();
Item.find({}, function(err, foundItems){ // Item.find() return an array

  if (foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("successfully added default items.");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  });
});


app.get("/:customListName", function(req, res){
  const listName = _.capitalize(req.params.customListName);
  List.findOne({name:listName}, function(err, foundList){  // Item.findONe() return an object/document
    if (!err){
      if(!foundList){
        // Create new list
        const list = new List({
          name : listName,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + listName);
      } else {
        // send the new list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name : listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});


app.post("/delete", function(req, res){
  const checkedIdBox = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedIdBox, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully deleted checked item.");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      {name:listName},//condition
      {$pull : {items :{_id : checkedIdBox}}}, // query
      function(err, foundList){ //callback
        if (!err){
          res.redirect("/" + listName);
        }
      }
    );
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully.");
});
