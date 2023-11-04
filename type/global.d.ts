declare global {
    /**
     * extend layout with blocks in current template file
     * @param layout
     */
    function extend(layout: string): any

    /**
     * define block with custom **name** and callback
     * @param name
     * @param [callback]
     */
    function block(name: string, callback?: Function): any

    /**
     * set property in current scope
     * @param path
     * @param value
     */
    function set(path: string, value: any): any

    /**
     * get property in current scope
     * @param path
     * @param defaults
     */
    function get(path: string, defaults?: any): any

    /**
     * import macro from file **path** and set to current scope **name** property
     * @param path
     * @param name
     */
    function use(path: string, name: string): any

    /**
     * define macro function with custom **name**
     * @param name
     * @param callback
     */
    function macro(name: string, callback: any): any

    /**
     * call macro function
     * @param name
     * @param props
     * @param callback
     */
    function call(name: string, props?: object, callback?: any): any

    /**
     * asynchronous template execution
     * @param promise
     * @param callback
     */
    function async(promise: Promise<any>, callback?: any): any

    /**
     * asynchronous template execution
     * @param callback
     */
    function fn(callback: Function): any

    /**
     *
     * @param {string} tag
     * @param {object} attrs
     * @param {function} content
     */
    function el(tag: string, attrs?: object, content?: any): any

    /**
     * buffer output
     * @param args
     */
    function echo(...args: any[]): any

    /**
     * append rendered template from file
     * @param path
     * @param data
     * @param cx
     */
    function include(path: string, data?: object, cx?: boolean): any

    /**
     *
     * @param value
     * @param callback
     */
    function each(value: any, callback: Function): any

    /**
     * define block with custom **name** and callback
     * @param {string} name
     * @param {object} [props]
     */
    function ui(name: string, props?: object): any
}

export = global
