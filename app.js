var methodOverride      = require("method-override"),
    expressSanitizer    = require("express-sanitizer"),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    express             = require("express"),
    app                 = express();

//setting up mongoose 
mongoose.connect("mongodb://localhost/restfulBlogApp");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//SCHEMA
var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: { type: Date,default: Date.now }
});

var Blog = mongoose.model("Blog", blogSchema);
// Blog.create({
//   title: "Test Blog",
//   image: "https://images.unsplash.com/photo-1478001517127-fccc92f54906?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=63597be27c598539afd0becc211be037&auto=format&fit=crop&w=750&q=80",
//   body: "test blog"
// });

//RESTFUL ROUTES
app.get("/", function(req,res){
    res.redirect("/blogs");
});
//Index route
app.get("/blogs", function(req, res){
   Blog.find({}, function (err, blogs){
      if(err){
          console.log(err);
      } else{
        res.render("index", {blogs: blogs});        
      }
   });
});
//NEw route
app.get("/blogs/new", function(req, res) {
    res.render("new");
});
//CREATE route
app.post("/blogs", function(req, res){
   //get the data from the form, add it to the db and then redirect to /blogs page
   req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.create(req.body.blog, function(err, newBlog){
      if(err){
          res.render("new");
      } else{
          res.redirect("/blogs");
      }
   });
    
});
//SHOW route to a certain id
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else{
           res.render("show", {blog: foundBlog});
       }
    });
});
//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog){
      if(err){
          res.redirect("/blogs");
      } else{
          res.render("edit", { blog: foundBlog });
      }
   });
});
//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    //find the blog and then update it with new data
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
            if(err){
                res.redirect("/blogs");
            }else{
                res.redirect("/blogs/"+req.params.id);
            }
        });
    });
});
//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
        //destroy and redirect
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server connected"); 
});