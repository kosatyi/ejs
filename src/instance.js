import { EJS } from './ejs'

const ejs = new EJS({
    /** defaults options **/
})

export const {
    __express,
    render,
    context,
    compile,
    helpers,
    preload,
    configure,
    create,
} = ejs
