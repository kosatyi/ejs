import { EjsMethods } from './ejs'

export interface EjsContext extends EjsMethods {
    /**
     * extend layout with blocks in current template file
     * @param layout
     * @readonly
     */
    extend(layout: string): any
    /**
     * define block with custom **name** and callback
     * @param name
     * @param [callback]
     * @readonly
     */
    block(name: string, callback?: Function): any
    /**
     * append rendered template from file
     * @param path
     * @param data
     * @param cx
     * @readonly
     */
    include(path: string, data?: object, cx?: boolean): any
    /**
     * set property to current context
     * @param path
     * @param value
     * @readonly
     */
    set(path: string, value: any): any
    /**
     * get property from current context
     * @param path
     * @param defaults
     * @readonly
     */
    get(path: string, defaults?: any): any
    /**
     * render ejs component
     * @param {string} name
     * @param {object} [props]
     * @param {any} [content]
     */
    ui(name: string, props?: object, content?: any): any
    /**
     * render html element
     * @param {string} tag
     * @param {object} [attrs]
     * @param {any} [content]
     * @readonly
     */
    el(tag: string, attrs?: object, content?: any): any
    /**
     * buffered function execution
     * @param callback
     * @readonly
     */
    fn(callback: Function): any
    /**
     * import macro from file **path** and set to current scope **name** property
     * @param path
     * @param name
     * @readonly
     */
    use(path: string, name: string): any
    /**
     * define macro function with custom **name**
     * @param name
     * @param callback
     * @readonly
     */
    macro(name: string, callback: any): any
    /**
     * call macro function
     * @param name
     * @param props
     * @param callback
     * @readonly
     */
    call(name: string, props?: object, callback?: any): any
    /**
     * buffer output
     * @param args
     * @readonly
     */
    echo(...args: any[]): any
    /**
     *
     * @param value
     * @param callback
     * @readonly
     */
    each(value: any, callback: Function): any
    /**
     * check if block with `name` exists
     * @param name
     * @readonly
     */
    hasBlock(name: string): boolean
    /**
     * @readonly
     */
    getParentTemplate(): boolean
}
