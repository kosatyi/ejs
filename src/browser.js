import { EJS } from './ejs.js'
import { httpRequest } from './fetch.js'

const ejs = new EJS({ resolver: httpRequest })

export const { render, context, compile, helpers, preload, configure, create } =
    ejs
