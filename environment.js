export default class Environment{
    constructor(){
        this.vars = {}
        this.functions = {}
        this.parent = null
    }

    setVar(name, value){
        this.vars[name] = value
    }

    getVar(name){
        let env = this
        
        while(!env.vars[name] && env.parent){
            env = env.parent
        }

        return env.vars[name]
    }

    setFunc(name, value){
        this.functions[name] = value
    }

    getFunc(name){     
        let env = this
        while(!env.functions[name] && env.parent){
            env = env.parent
        }
        return env.functions[name]
    }
}