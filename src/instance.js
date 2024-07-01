import { EJS } from './ejs.js'

const ejs = new EJS()

export const { render, context, compile, helpers, preload, configure, create } =
    ejs
