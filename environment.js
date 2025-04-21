export default class Environment{
    constructor(){
        this.vars = []
    }


    setVar(name, value){
        this.vars[name] = value
    }

    getVar(name){        
        return this.vars[name]
    }
}