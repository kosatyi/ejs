# EJS 

Embedded JavaScript templates

![npm](https://img.shields.io/npm/v/@kosatyi/ejs.svg)
![downloads](https://img.shields.io/npm/dt/@kosatyi/ejs.svg)
![license](https://img.shields.io/npm/l/@kosatyi/ejs.svg)
![github-issues](https://img.shields.io/github/issues/kosatyi/ejs.svg)

## Install

You can get EJS via [npm](http://npmjs.com).

```bash
$ npm install @kosatyi/ejs --save
```

## Usage

```js
const ejs = require('@kosatyi/ejs');

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
app.set('view engine', 'ejs')
app.set('view options', {
    watch: true,
})
```

or use `ejs` alias

```bash
$ npm install ejs@npm:@kosatyi/ejs --save
```

```js
// const ejs = require('ejs')
const express = require('express')
const app = express()
app.set('views', 'views')
app.set('view engine', 'ejs')
app.set('view options', {
    watch: true,
})
```

## Template Example

**layout/default.ejs**

```ejs
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

```ejs
<% extend('layout/default') %>

<% set('title','Page Title') %>

<% block('resources',(parent)=>{ %>
    <% parent() %>
    <script defer src="/dist/framework.js"></script>
<% }) %>

<% block('content',()=>{ %>

<% each('posts',(post)=>{ %>
<article>
    <h3><%-post.title%></h3>
    <div><%=post.content%></div>
</article>
<% }) %>

<% }) %>
```
