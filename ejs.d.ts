declare namespace ejs {
    // extend layout with blocks in current template file
    function extend(layout: string);
    // define block with custom **name** and callback
    function block(name: string, callback );
    // set property in current scope
    function set(path: string, value: any);
    // get property in current scope
    function get(path: string, defaults: any );
    // import macro from file **path** and set to current scope **name** property
    function use(path: string, name: string);
    // define macro function with custom **name**
    function macro(name: string, callback );
    // call macro function
    function call(name: string, props?: object, callback?);
    // asynchronous template execution
    function async(promise: Promise<any>, callback?);
    // asynchronous template execution
    function fn(callback: Function);
    // buffer output
    function echo(...any);
    // buffer output
    function include();
    // buffer output
    function include();
}