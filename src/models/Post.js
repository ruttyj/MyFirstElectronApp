import { Model } from '@vuex-orm/core'
import User from '@/models/User'


class Post extends Model {
    // `this.belongsTo` is for belongs to relationship. The first argument is
    // the Model class, and second is the field name for the foreign key.
    static fields () {
      return {
        id: this.attr(null),
        user_id: this.attr(null),
        title: this.attr(''),
        body: this.attr(''),
        published: this.attr(false),
        author: this.belongsTo(User, 'user_id')
      }
    }
  }


Post.entity = 'posts'

export default Post