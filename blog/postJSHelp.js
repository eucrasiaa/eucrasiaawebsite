/*
example 001.json file structure:
    {
    "postCount": 4,
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
        },
        {
            "date": "1122",
            "mood": ":3",
            "bodyText": "aaaa.&nbsp; as efj the document my&nbsp;<a href=\"willcapitos.com\">demoLink</a>&nbsp;<b>exdwdwedample eofo</b>&nbsp;some of the&nbsp;<i>&nbsp;featureas</i>i can do! asas",
            "song": "my son- gtle",
            "image": {
                "hasImage": true,
                "src": "./imgs/2025-11-13.webp",
                "alt": "no alt provided"
            }
        },
        {
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
    ]
}
    */
//define post object struycture to be compatable with this function:


// post object structure:
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

class PostManager {
    constructor(postsPerJSON) {
        this.postsPerJSON = postsPerJSON;
        this.allPosts = []; //all post objects here, from index.json
        this.posts = []; // which posts allPosts are currently being displayed
        this.loadedJsons = []; // track loaded JSON files
        this.postsToLoad = []; // posts that have been processed but are not yet loaded into the page
        this.containerID ="";
        this.hasDoneInitialLoad = false;
        this.filesErrored = [];
        this.hitErrorLoading = false;
        this.IsCurrentlyLoading = false;
        this.disableLoading = false;
    }
    printValues() {
        console.log('postsPerJSON:', this.postsPerJSON);
        console.log('allPosts:', this.allPosts);
        console.log('posts:', this.posts);
        console.log('loadedJsons:', this.loadedJsons);
        console.log('postsToLoad:', this.postsToLoad);
        console.log('filesErrored:', this.filesErrored);
        console.log('hitErrorLoading:', this.hitErrorLoading);
        console.log('IsCurrentlyLoading:', this.IsCurrentlyLoading);
        console.log('disableLoading:', this.disableLoading);


    }

    // initialize:
    async init( containerID) {
        try {
            const response = await fetch('./posts/index.json');
            const indexData = await response.json();
            this.postsPerJSON = indexData.postsPerJSON;
            this.allPosts = indexData.posts || [];
            this.loadedJsons = [];
            this.containerID = containerID;
            this.hasDoneInitialLoad = false;
            this.disableLoading = false;
            this.hitErrorLoading = false;

            console.log('Loaded posts from index.json:', this.allPosts);
            // do initial load of posts from the latest JSON file
            if (this.allPosts.length > 0) {
                const latestEntry = this.allPosts.reduce((a, b) => (a.id > b.id ? a : b));
                // pop from allPosts and push to loadedJsons
                
                await this.loadPostsFromFile(latestEntry.file);
                // if we loaded, then remove the file from allPosts and add it to loadedJsons
                this.allPosts = this.allPosts.filter(post => post.file !== latestEntry.file);
                this.hasDoneInitialLoad = true;
                await this.appendPostsToPage();
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            // if json load fails, skip this page and attempt the next one if you can
            // so just call attemptNextPostLoad() if there are more posts to load
            if (this.allPosts.length > 0) {
                await this.attemptNextPostLoad();
            }
        }
    }

    async loadPostsFromFile(filename) {
        console.log(`Attempting to load posts from ${filename}...`);
        // pull out: postCount, and posts array
        // then for each post in posts array, create a Post object and push it to this.posts
        try {
            const response = await fetch(`./posts/${filename}`);
            const postData = await response.json();
            console.log(`Loaded posts from ${filename}:`, postData);
            if (postData && postData.posts) {
                postData.posts.forEach(post => {
                    const postObj = new Post(
                        post.date,
                        post.mood,
                        post.bodyText,
                        post.image.src,
                        post.image.alt,
                        post.song
                    );
                    this.postsToLoad.push(postObj);
                });
                console.log('Current posts in PostManager:', this.postsToLoad);
                this.loadedJsons.push(filename);
            } else {
                console.warn(`No posts found in ${filename}`);
            }
        } catch (error) {
            console.log(`Error loading posts from ${filename}:`, error);
            this.filesErrored.push(filename);
            this.hitErrorLoading = true;
            // remove the file from allPosts so we don't try to load it again
            this.allPosts = this.allPosts.filter(post => post.file !== filename);
            this.printValues();
            
            await this.handleErrorOnFile();
        }
    }
    async handleErrorOnFile(){
        // if we are in hitErrorLoading = true, and there are more files to attempt to laod, 
        if (this.hitErrorLoading && this.allPosts.length > 0) {
            this.hitErrorLoading = false; // reset the error flag before attempting to load the next file
            console.warn('Error loading file. Attempting to load next file if available.');
            const result = await this.attemptNextPostLoad();
            console.log ('Result of attempting to load next file after error:', result);
            if (result == true){
                console.log('Successfully loaded next file after error.');
                this.hitErrorLoading = false; // reset the error flag if we successfully loaded the next file
            }
        }
        
    }
    async appendPostsToPage() {
        const container = document.getElementById(this.containerID);
        if (!container) {
            console.error(`Container with id "${this.containerID}" not found.`);
            return;
        }
        //reverse the postsToLoad array so that the latest posts are appended first
        this.postsToLoad.reverse();
        this.postsToLoad.forEach(async post => {
            console.log('Appending post to page:', post);
            const postElement = await this.appendPost(post);
            
            container.appendChild(postElement);
            this.posts.push(post);
        });
        this.postsToLoad = [];
    }

    async attemptNextPostLoad() { 
        //skip safety check  if we are in error and let us continue regardless 
        if (this.hitErrorLoading) {
            if (this.IsCurrentlyLoading) {
                console.warn('Already loading posts. Please wait until the current load is complete.');
                return false;
            }
        }
        else{
            console.log("skipping safety check since we are in error loading state");
        }
        this.IsCurrentlyLoading = true;
        // fake mutex-like, just prevent double loads

        // postsToLoad should be empty
        // if all the elements in loadedJsons is in allPosts, we cant load anymore.
        // otherwise, get the last element in allPosts, load it, and remove it from allPosts and add it to loadedJsons
        if (this.postsToLoad.length > 0) {
            console.warn('There are still posts to load. Please wait until they are loaded before attempting to load more.');
            return;
        }
        if (this.allPosts.length === 0) {
            console.log('No more posts to load.');
            this.disableLoading = true;
            // append a "End of blog message" to the page
            const container = document.getElementById(this.containerID);
            const endMessage = document.createElement('div');
            endMessage.classList.add('end-of-blog-message');
            endMessage.textContent = "End of blog.";
            container.appendChild(endMessage);
            return;
        }
        const nextEntry = this.allPosts[this.allPosts.length - 1];
        await this.loadPostsFromFile(nextEntry.file);
        this.allPosts = this.allPosts.filter(post => post.file !== nextEntry.file);
        this.hasDoneInitialLoad = true;
        await this.appendPostsToPage();
        this.IsCurrentlyLoading = false;
        return true;
    }
    async appendPost(postData) {
        const postContainer = document.createElement('article');
        postContainer.classList.add('post', 'clearfix');
        postContainer.innerHTML = `
        <article class="post clearfix">
                    <div class="postContainer">
                        <div class="meta">
                            <span class="date">${postData.date}</span>
                            <span class="mood">${postData.mood}</span>
                        </div>
                        <div class="image_body_container">
                            ${postData.image.hasImage ? 
                                `<div class="imagethumbnail" aria-hidden="true">
                                    <img src="${postData.image.src}" alt="${postData.image.alt}">
                                </div>` : 
                                `<div class="image_empty" aria-hidden="true"></div>`
                            }
                            
                            <div class="body">
                                <p class="bodyText">${postData.bodyText}</p>
                            </div>
                        </div>
                        <div class="metabottom">
                            <span class="song">${postData.song}</span>
                        </div>
                    </div>
                </article>
                `;
        return postContainer;
                        }
}
    
// open index.json (will be run in browser, not node)
// ex:
/*
{
"postsPerJSON":20,
"posts": [
    { "id": 1, "file": "001.json"}
  ]
}
*/