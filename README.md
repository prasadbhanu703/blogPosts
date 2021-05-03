# blogposts

           >>>    What are to be installed and how to run <<<

>>> First of all you have to do "npm install" and you can run it on node/src/index.js

>>> I have created a mongodb database with installing "npm install mongoose" and setting dbPath to that data.

>>> You need to do "npm i express" , "npm i express-session", "npm i bcrypt" for installing frameworks.

>>> Added files to gitHub (https://github.com/prasadbhanu703/blogposts) and it is in public mode.

           >>>    How to check the code ? follow below instruction <<<

>> /signup(POST) - to user signup 

>> /login(POST) - to user login

>> /posts (POST) - to create a new blog post

>> /posts(PUT) - to update an existing post

>> /posts(DELETE) - to delete an existing post

>> /posts(GET) - to get all posts (only title and author)

>> /posts/postId (GET) - if(postId is number) returns single blog post (with title + author + content)
                        - i(postId is NAN ) returns filtered list of posts ( filter by tite)

>> /adminLogin(POST) - to admin login

>> /deleteByAdmin(POST) - to delete any post users posts by admin 

>> /logout(POST) - to logout user (Note : uncomment in code and use).


