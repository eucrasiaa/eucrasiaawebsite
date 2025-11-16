// takes in a post object and adds it to the correct post json:
// look at index.json, log postsPerJSON value
// find highest number id (the latest posts json)
// open it, and check the value of the postCount. if its equal to postsPerJSON, 
// create a new json with id+1 and postCount 0, and add the post to it. if its less than postsPerJSON, add the post to the current json and increment postCount by 1.
// if you create a new json, add it to the index.json posts array with the new id and file name.

const fs = require('fs');
const path = require('path');

let devIter = 3;
let postsInFile =0;
class Post {
    constructor(date, mood, bodyText, imageSrc, imageAlt, song) {
        this.date = date;
        this.mood = mood;
        this.bodyText = bodyText;
        this.image = {
            hasImage: !!imageSrc,
            src: imageSrc || "",
            alt: imageAlt || ""
        };
        this.song = song || "";
    }
}
// append posts to 003DEV.json, parsing the wtestData.txt and every 4 lines is a new post (by newline)
function parseTestDataAndAppendPosts(testDataPath) {
    const testData = fs.readFileSync(testDataPath, 'utf-8');
    const lines = testData.split(/\r?\n/).map(l => l.trim());
    for (let i = 0; i < lines.length; i += 4) {
        const date = i.toString().padStart(2, '0');
        const mood = ":O"
        const bodyText = lines[i] + (lines[i + 1] || "") + (lines[i + 2] || "") || "" + (lines[i + 3] || "");
        const imageSrc = "";
        const imageAlt = "";
        const song = "";
        const post = new Post(date, mood, bodyText, imageSrc, imageAlt, song);
        console.log('Appending post:', post);
        devAppend(post);
    }
}
function devAppend(post) {
    // write to ${devIter}DEV.json
    postsInFile++;
    if (postsInFile > 20) {
        devIter++;
        postsInFile = 0;
    }
    if (devIter > 10) {
        console.error('Reached maximum dev file limit. No more posts will be appended.');
        return;
    }
    const devFilePath = path.join(__dirname, `${devIter}DEV.json`);
    let devJson;
    try {
        devJson = JSON.parse(fs.readFileSync(devFilePath, 'utf-8'));
    } catch (err) {
        // If file missing or invalid, initialize it
        devJson = { postCount: 0, posts: [] };
    }
    devJson.posts.push(post);
    devJson.postCount = devJson.posts.length;
    fs.writeFileSync(devFilePath, JSON.stringify(devJson, null, 2), 'utf-8');
}
// parseTestDataAndAppendPosts(path.join(__dirname, 'wtestData.txt'));
// post object:
/*
template:
{
    "postCount": 2,
    "posts": [
        {
            "date": "2025-11-13",
            "mood": ":\\",
            "bodyText": "browsed lots of websites today. played a cool game called <a href=\"https://dosogy.itch.io/mroi\">MROI_</a>. i need to fix my website. art is hard. DX friday. exams all next week.",
            "image":{
                "hasImage": true,
                "src": "./imgs/2025-11-13.webp",
                "alt": "alt-text-here"
            },
            "song": "52 blue mondays - jane remover"
        },
        {
            "date": "2025-11-12",
            "mood": ":)",
            "bodyText": "body text body text body text",
            "image":{
                "hasImage": false,
                "src": "",
                "alt": ""
            },
            "song": "some song - some artist"
        }
    ]
}
*/
// define post object structure


// pass argument
// prompt for user stirng, will be given:
/*{
    "date": "1122",
    "mood": ":3",
    "bodyText": "EXAMple post 11122&nbsp;",
    "song": "my aason- gtle",
    "image": {
        "hasImage": false,
        "src": "",
        "alt": ""
    }
}
*/