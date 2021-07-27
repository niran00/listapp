const express = require('express');

const app = express(); 

var items = ["Buy Food", "Cook Food", "Eat Food"];
var workItems = [];

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function(req, res)
{

    var today = new Date();
    var currentDay = today.getDay();
    var day = ""; 

    var options = {
        weekday: "long",
        day: "numeric",
        year: "numeric",
        month: "long"
    };

    var day = today.toLocaleDateString("en-US", options);

    res.render('list', {listTitle: day, newListItems: items});
        
});

app.post("/", function(req, res){
    console.log(req.body)
    item = req.body.newItem;

    if(req.body.list === "Work")
    {
        workItems.push(item);
        res.redirect("/work"); 
    } else {
        items.push(item);
        res.redirect("/"); 
    }
 
});

app.get("/work", function(req, res){
    res.render('list', {listTitle: "Work List", newListItems: workItems} );
})

app.get("/about", function(req, res){
    res.render("about");
})

app.listen(2222, function()
{
    console.log('In port 2222'); 
});