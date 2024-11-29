# EJS 

Embedded JavaScript templates with extend/block

[![npm](https://img.shields.io/npm/v/@kosatyi/ejs.svg)](https://www.npmjs.com/package/@kosatyi/ejs)
[![github-issues](https://img.shields.io/github/issues/kosatyi/ejs.svg)](https://github.com/kosatyi/ejs/issues)
[![license](https://img.shields.io/npm/l/@kosatyi/ejs.svg)](https://github.com/kosatyi/ejs/blob/master/LICENCE)

## Install

You can get EJS via [npm](http://npmjs.com).

```bash
$ npm install @kosatyi/ejs
```

## Usage

```js
const ejs = require('@kosatyi/ejs');

// path where templates is located 
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
ejs.render('page/index',{
    posts:[{
        title:'Post Title',
        content:"<p>post content</p>"
    }]
}).then((content)=>{
    console.log(content)
})
```


## Use with Express

```bash
$ npm install @kosatyi/ejs --save
```

```js
const express = require('express')
const ejs = require('@kosatyi/ejs')
const app = express()
app.engine('ejs', ejs.__express)
app.set('views', 'views')
app.set('view cache', false)
app.set('view engine', 'ejs')
```

or use `ejs` alias

```bash
$ npm install ejs@npm:@kosatyi/ejs --save
```

```js
const express = require('express')
const app = express()
app.set('views', 'views')
app.set('view engine', 'ejs')
app.set('view cache', false)
```

## Template Example

**layout/default.ejs**

```ejs
<html>
    <head>
        <title><%-ejs.get('title')%></title>
        <% ejs.block('resources',()=>{ %>
            <link rel="stylesheet" type="text/css" href="/dist/styles.css">
        <% }) %>
    </head>
    <body>
        <header>
            <% ejs.block('header',()=>{ %>
                <h1><%-ejs.get('title')%></h1>
            <% }) %>            
        </header>
        <main>
            <% ejs.block('content') %>
        </main>
        <footer>
            <% ejs.block('footer',()=>{ %>
            Copyright
            <% }) %>
        </footer>
    </body>
</html>
```

**page/index.ejs**

```ejs
<% ejs.extend('layout/default') %>

<% ejs.set('title','Page Title') %>

<% ejs.block('resources',(parent)=>{ %>
    <% parent() %>
    <script defer src="/dist/framework.js"></script>
<% }) %>

<% ejs.block('content',()=>{ %>

<% ejs.each('posts',(post)=>{ %>
<article>
    <h3><%-post.title%></h3>
    <div><%=post.content%></div>
</article>
<% }) %>

<% }) %>
```
