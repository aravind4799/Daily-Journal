//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const mongoose = require("mongoose");

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);



mongoose.connect("mongodb+srv://admin_aravind:battlebee4799@cluster0-e7ve9.mongodb.net/BlogDB",{ useNewUrlParser: true,useUnifiedTopology: true });

const BlogSchema = new mongoose.Schema({
  day:{
    required:true,
    type:String
  },
  content:{
    required:true,
    type:String
  }
});

const EditShema = {
  title:String,
  content:String
}

const content = mongoose.model("content",BlogSchema);

const edit = mongoose.model("edit",EditShema);

//the created database is visible in mongoshell only if contains some data in it..
// const demo_data = content({
//   day:"day1",
//   content:"working"
// });
//
// demo_data.save();


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


const home_content = edit({
  title:"Home",
  content:homeStartingContent
})

const about_content = edit({
  title:"About",
  content:aboutContent
})

const contact_content = edit({
  title:"Contact",
  content:contactContent
})

 const default_content =[home_content,about_content,contact_content]

  edit.insertMany(default_content,function(err){
    if(!err){
      //console.log("default items inserted");
    }
  });



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res){

  edit.findOne({title:"Home"},function(err,home_data){
    if(!err){
      content.find({},function(err,post_data){
        if(!err){
          res.render("home",{startingContent:home_data.content,posts:post_data})
         }
      })
    }
  })
});

app.get("/about", function(req, res){

  edit.findOne({title:"About"},function(err,found_data){
    if(!err){
      res.render("about", {aboutContent: found_data.content});
    }
  })

});

app.get("/contact", function(req, res){

  edit.findOne({title:"Contact"},function(err,found_data){
    if(!err){
      res.render("contact", {contactContent: found_data.content});
    }
  })

});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/edit",function(req,res){
  res.render("edit")
})

app.post("/edit",function(req,res){
  let edit_content = req.body.postBody
  let edit_content_for = req.body.button

  let query = {title:_.capitalize(edit_content_for)}

  edit.findOneAndUpdate(query,{$set:{content:edit_content}},function(err,found_data){
    if(!err){
      //console.log("updated");
      if(edit_content_for==="Home"){
        res.redirect("/")
      }
      else{
        res.redirect("/"+ edit_content_for)
      }
    }
  })
})

app.post("/compose", function(req, res){
  const data = content({
    day: _.capitalize(req.body.postTitle),
    content: req.body.postBody
  });
//mongoose doesnt have insert functions
  data.save(function(err){
    if(!err){
      res.redirect("/")
    }
  });
});

app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.capitalize(req.params.postName);

  content.findOne( {day:requestedTitle} ,function(err,found_data) {

    if(!err){
      if (found_data===null){
        res.sendFile(__dirname + "/404error.html")
      }
      else{
      res.render("post",{title:found_data.day,content:found_data.content})
    }
    }
  })
});

app.get("*", function(req,res){
  res.sendFile(__dirname +"/404error.html")
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
