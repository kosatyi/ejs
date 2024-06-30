import { EJS } from './ejs'

const ejs = new EJS()

export const { render, context, compile, helpers, preload, configure, create } =
    ejs
