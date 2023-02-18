const fs = require('fs');
const { resolve } = require('path');
const path = require("path");


let posts = [];
let categories = [];

function initialize() {

    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "data", "posts.json"), 'utf8', (err, data) => {
            if (err) {

                reject("Unable to read posts file");
            }

            posts = JSON.parse(data);


            fs.readFile(path.join(__dirname, "data", "categories.json"), 'utf8', (err, data) => {
                if (err) {

                    reject("Unable to read categories file");
                }
                categories = JSON.parse(data);

                resolve();
            });
        });
    })
}

function getAllPosts() {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("No results returned");
        } else {
            resolve(posts);
        }
    })
}

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        let publishedPosts = [];
        posts.forEach((post) => {
            if (post.published === true) {
                publishedPosts.push(post);
            }
        })

        if (publishedPosts.length > 0) {
            resolve(publishedPosts);
        } else {
            reject("No results returned");
        }
    })
}


function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("No results returned");
        } else {
            resolve(categories);
        }
    })
}
function addPost(postData) {
    return new Promise((resolve, reject) => {
        if (postData.published === undefined) {
            postData.published = false;
        } else {
            postData.published = true;
        }

        postData.id = posts.length + 1;
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        postData.postDate = formattedDate;

        posts.push(postData);

        resolve(postData);
    });
}
function getPostsByCategory(category) {
    
  return new Promise((resolve, reject) => {
    let thePosts = [];
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].category == category) {
        thePosts.push(posts[i]);
      }
    }
    if (thePosts.length === 0) {
      reject("no results returned");
    }
    resolve(thePosts);
  });
}

function getPostsByMinDate(minDateStr) {
   
    return new Promise((resolve, reject) => {
        let thePosts = [];
        for (let i = 0; i < posts.length; i++) {
          if (new Date(posts[i].postDate) >= new Date(minDateStr)) {
            thePosts.push(posts[i]);
          }
        }
        if (thePosts.length === 0) {
          reject("no results returned");
        }
        resolve(thePosts);
      });
}
function getPostById(id) {
    return new Promise((resolve, reject) => {
        let found = false;
        for (let i = 0; i < posts.length; i++) {
          if (posts[i].id == id) {
            found = true;
            resolve(posts[i]);
            
          }
        }
        if (!found) {
          reject("no results returned");
        }
      });
  }
  


module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById };