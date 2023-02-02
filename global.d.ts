declare global {
    /**
     * extend layout with blocks in current template file
     * @param layout
     */
    function extend(layout: string);

    /**
     * define block with custom **name** and callback
     * @param name
     * @param [callback]
     */
    function block(name: string, callback?);

    /**
     * set property in current scope
     * @param path
     * @param value
     */
    function set(path: string, value: any);

    /**
     * get property in current scope
     * @param path
     * @param defaults
     */
    function get(path: string, defaults?: any);

    /**
     * import macro from file **path** and set to current scope **name** property
     * @param path
     * @param name
     */
    function use(path: string, name: string);

    /**
     * define macro function with custom **name**
     * @param name
     * @param callback
     */
    function macro(name: string, callback);

    /**
     * call macro function
     * @param name
     * @param props
     * @param callback
     */
    function call(name: string, props?: object, callback?);

    /**
     * asynchronous template execution
     * @param promise
     * @param callback
     */
    function async(promise: Promise<any>, callback?);

    /**
     * asynchronous template execution
     * @param callback
     */
    function fn(callback: Function);

    /**
     *
     * @param {string} tag
     * @param {object} attrs
     * @param {function} content
     */
    function el(tag: string, attrs?: object, content?: any);

    /**
     * buffer output
     * @param any
     */
    function echo(...any);

    /**
     * append rendered template from file
     * @param path
     * @param data
     * @param cx
     */
    function include(path: string, data?: object, cx?: boolean);

    /**
     *
     * @param value
     * @param callback
     */
    function each(value:any,callback:Function);

}

export = global

