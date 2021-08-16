const express = require('express');
const mongoose = require('mongoose');
const app = express(); 
var _ = require('lodash');
const date = require(__dirname + '/date.js');

mongoose.connect('mongodb+srv://niran:niran1234@listcluster.jpgz5.mongodb.net/listAppDatabase?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Conntected to Database"); 
});

const itemsSchema = new mongoose.Schema({
    name: {
        type: String, 
        require: (true, "Task Name is required")
    }
})


const Item = mongoose.model('Item', itemsSchema); 

const item1 = new Item({ name: "Welcome to to do List"}); 
const item2 = new Item({ name: "Press + button to add a new item"}); 
const item3 = new Item({ name: "← Check this box to delete"}); 

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String, 
    items: [itemsSchema]
}

const List = mongoose.model("list", listSchema);




var workItems = [];

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function(req, res)
{
    let day = date.getDate();    
    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){

            Item.insertMany(defaultItems, function(err){
                if(err)
                {
                    console.log(err);
                } else {
                    console.log("Items successfully added");
                }
                res.redirect("/");
            });

        } else {
            res.render('list', {listTitle: 'Today', newListItems: foundItems});
        }

        

        
    })
    
        
});


app.post("/", function(req, res){
    console.log(req.body);

    const itemName = req.body.newItem;
    const listName = req.body.list;


    const item = new Item({ 
        name: itemName
    }); 

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName); 
        });
    }


 
});


app.post("/delete", function(req, res){

    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){

        Item.findByIdAndRemove(checkedItem, function(err){
            if(!err){
                console.log("Successfully Deleted");
                res.redirect("/");
            }
        });

    } else {
        List.findOneAndUpdate({name: listName}, { $pull: {items: {_id: checkedItem}} }, function(err, foundList){
            if(!err){
                res.redirect("/" + listName); 
            }
        });
    }

    
});



app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){

                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render('list', {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });

   
    

});

app.get("/about", function(req, res){
    res.render("about");
});

app.listen(process.env.PORT || 3000, function()
{
    console.log('In port 3000'); 
});