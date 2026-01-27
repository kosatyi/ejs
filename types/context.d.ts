export interface ContextScope {
    /**
     * extend layout with blocks in current template file
     * @param layout
     */
    extend(layout: string): any
    /**
     * define block with custom **name** and callback
     * @param name
     * @param [callback]
     */
    block(name: string, callback?: Function): any
    /**
     * append rendered template from file
     * @param path
     * @param data
     * @param cx
     */
    include(path: string, data?: object, cx?: boolean): any
    /**
     * set property in current scope
     * @param path
     * @param value
     */
    set(path: string, value: any): any
    /**
     * get property in current scope
     * @param path
     * @param defaults
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
     */
    el(tag: string, attrs?: object, content?: any): any
    /**
     * buffered function execution
     * @param callback
     */
    fn(callback: Function): any
    /**
     * import macro from file **path** and set to current scope **name** property
     * @param path
     * @param name
     */
    use(path: string, name: string): any
    /**
     * define macro function with custom **name**
     * @param name
     * @param callback
     */
    macro(name: string, callback: any): any
    /**
     * call macro function
     * @param name
     * @param props
     * @param callback
     */
    call(name: string, props?: object, callback?: any): any
    /**
     * asynchronous template execution
     * @param promise
     * @param callback
     */
    async(promise: Promise<any>, callback?: any): any
    /**
     * buffer output
     * @param args
     */
    echo(...args: any[]): any
    /**
     *
     * @param value
     * @param callback
     */
    each(value: any, callback: Function): any
    /**
     * check if block with `name` exists
     * @param name
     */
    hasBlock(name: string): boolean
}
