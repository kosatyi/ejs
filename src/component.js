import { extend } from './utils'
import element from './element'
/**
 *
 * @param {{}} instance
 * @method create
 */
const Component = (instance) => {
    const defaults = extend({}, instance.props)
    const create = instance.create
    return {
        element,
        create,
        render(props) {
            return this.create(extend({}, defaults, props))
        },
    }
}

export default Component
