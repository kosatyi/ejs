import { EJS } from './ejs.js'
import { readFile } from './readfile.js'
import { expressRenderer } from './express.js'

const ejs = new EJS({ resolver: readFile })

const { render, context, compile, helpers, preload, configure, create } = ejs

export const __express = expressRenderer(ejs)

export { render, context, compile, helpers, preload, configure, create }
