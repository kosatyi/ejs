# EJS 

Embedded JavaScript templates

![npm](https://img.shields.io/npm/v/@kosatyi/ejs.svg)
![downloads](https://img.shields.io/npm/dt/@kosatyi/ejs.svg)
![license](https://img.shields.io/npm/l/@kosatyi/ejs.svg)
![github-issues](https://img.shields.io/github/issues/kosatyi/ejs.svg)

## Install

You can get Mustache via [npm](http://npmjs.com).

```bash
$ npm install @kosatyi/ejs --save
```

## Usage

```js
var ejs = require('@kosatyi/ejs');
// path where templates is located (views by default so you can skip this step)
ejs.configure({
    path: 'views'
})
// add custom template helper functions
ejs.helpers({
    ucase(text){
        return String(text).toUpperCase()
    }
})

// load index.ejs template from `views` folder
ejs.render('page/index').then((content)=>{
    console.log(content)
})
```

**layout/default.ejs**

```html
<html>
    <head>
        <title><%-get('title')%></title>
        <% block('resources',()=>{ %>
            <link rel="stylesheet" type="text/css" href="/dist/styles.css">
        <% }) %>
    </head>
    <body>
        <header>
            <% block('header',()=>{ %>
                <h1><%-get('title')%></h1>
            <% }) %>            
        </header>
        <main>
            <% block('content') %>
        </main>
        <footer>
            <% block('footer',()=>{ %>
            Copyright
            <% }) %>
        </footer>
    </body>
</html>
```

**page/index.ejs**

```html
<% extend('layout/default') %>

<% set('title','Page Title') %>

<% block('resources',(parent)=>{ %>
    <% parent() %>
    <script defer src="/dist/framework.js"></script>
<% }) %>

<% block('content',()=>{ %>
Content
<% }) %>
```
