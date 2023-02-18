/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name:  ID:  Date: 17 February 2023


********************************************************************************/
const path = require("path");
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { addPost } = require("./blog-service");

cloudinary.config({
  cloud_name: "dsdhorks2",
  api_key: "193969161988572",
  api_secret: "WhHb_VpP6gcdrO7EAQXQO3aikhg",
  secure: true,
});

const upload = multer();

const blog_service = require(path.join(__dirname, "./blog-service.js"));
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", (req, res) => {
  blog_service
    .getPublishedPosts()
    .then((resolve) => {
      res.send(resolve);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/posts", (req, res) => {
  blog_service
    .getAllPosts()
    .then((resolve) => {
      res.send(resolve);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/categories", (req, res) => {
  blog_service
    .getCategories()
    .then((resolve) => {
      res.send(resolve);
    })
    .catch((err) => {
      res.send(err);
    });
});
app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
});
app.post("/posts/add", upload.single("featureImage"), (req, res, next) => {
  const currentDate = new Date(Date.now());
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  let title = req.body.title;
  let body = req.body.body;
  let category = req.body.category;
  let published = false;
  let postedDate = formattedDate;
  let featureImage = "";
  if (req.body.published === "on") {
    published = true;
  }
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost("");
  }
  function processPost(imageUrl) {
    featureImage = imageUrl;
    let post = {
      title,
      body,
      category,
      published,
      postedDate,
      featureImage,
    };
    addPost(post)
      .then(() => {
        res.redirect("/posts");
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});
// Catch Errors
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Port to listen to requests
const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on " + HTTP_PORT);
}

blog_service
  .initialize()
  .then(() => {
    // Listen on port 8080
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((msg) => {
    console.log("Error in initialize():" + msg);
  });
