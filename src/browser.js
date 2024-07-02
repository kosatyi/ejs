import { EJS } from './ejs.js'
import { httpRequest } from './fetch.js'

const ejs = new EJS({ resolver: httpRequest })

const { render, context, compile, helpers, preload, configure, create } = ejs

export { render, context, compile, helpers, preload, configure, create }
