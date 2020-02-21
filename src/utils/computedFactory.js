class ComputedFactory {
    constructor(){
  
    }
  
    makePropSync(name){
      return {
        get(){
          return this[name];
        },
        set(val){
          this.$emit(`${name}:update`, val);
        }
      }
    }
  
  
    makeORMSync(model, where){
      return {
        get(){
            return model.query().where(where).first();
          },
          set(val){
            model.update({
              where: where,
              data: val,
            })
          }
      }
    }
  
  }

  export default ComputedFactory;