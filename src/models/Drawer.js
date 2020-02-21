import { Model } from '@vuex-orm/core'

class Drawer extends Model {

  // List of all fields (schema) of the post model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields () {
    return {
        id: this.attr(null),
        key: this.attr(''),
        name: this.attr(''),
        type: this.attr('permanent'),
        clipped: this.attr(false),
        floating: this.attr(false),
        mini: this.attr(true),
        shown: this.attr(true)
    }
  }
}

// This is the name used as module name of the Vuex Store.
Drawer.entity = 'drawer';

Drawer.primaryKey = 'key'

Drawer.initialData = [
  {
    id: 1,
    key: 'main',
    type: 'permanent',
    clipped: false,
    floating: false,
    mini: true,
    shown: true
  }
]

export default Drawer