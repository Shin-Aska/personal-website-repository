Introduction
============

This repository is the source code for my personal website, www.richardorilla.website. 
The website is written in HTML, CSS, and JavaScript. There are some tidbits of PHP, mostly
for security purposes (such as nonce) and some header related items but they are not really important.

Heck you can host this using Python's http-server and it will not really matter 😁

Python Code
===========

Currently I am working on automating the steps in creating a new blog post. Normally I wrote my
blog posts in the default template and make a copy in the classic template with adjustments to ensure
it works without Javascript.

Now I am working on a Python script that will automate the process by making all of my blog posts
written in markdown and then converting them to HTML.

Currently the base script is called publisher.py but I will be making interfaces for it to make it more useable
in the future.


Contribution
============

This repository is not open for contribution. However, if you find any issues, and you really 
wish to do something about it, feel free to contact me at mailto:richardorilla@pm.me. 
Alternatively you could also open an issue here on Github

External Libraries
=============
Although majority of the code is written by me, I have used some external libraries to make my life easier. Here are some of them:

1. Highlight.js - For syntax highlighting
2. Three.js - For 3D animations
3. Jquery - For DOM manipulation (Although I am trying to get away with this)
4. DataTables - For interactive tables

As you can see, all of them are in Javascript. These are not use on the non-javascript version of the website.