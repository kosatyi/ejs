import { extend } from './utils'
import element from './element'
/**
 *
 * @param {{}} instance
 * @method create
 */
function Component(instance) {
    this.props = extend({}, instance.props)
    this.create = instance.create.bind(this)
}
/**
 *
 */
Component.prototype = {
    element,
    render(props) {
        return this.create(extend({}, this.props, props))
    },
}
/**
 *  @type {function}
 */

export default Component
