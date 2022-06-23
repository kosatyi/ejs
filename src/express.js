function configure(ejs) {
    function Express(path, options) {
        this.path = path
        this.options = options
    }
    Express.prototype.render = function (options, callback) {
        ejs.render(this.path, options)
            .then(
                function (content) {
                    callback(null, content)
                }.bind(this)
            )
            .catch(
                function () {
                    callback('template not found: ' + this.path)
                }.bind(this)
            )
    }
    return Express
}

module.exports = configure
