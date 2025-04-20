import { Token } from  './tokens.js'
import { parseError } from  './utils.js'
import util from 'util';


class Expr{
    constructor(){}
}

export class Binary extends Expr{
    constructor(left, op, right, line){
        super()
        if( !(left instanceof Expr) ){parseError(line, `${left} is not an expression`)}
        if( !(right instanceof Expr) ){parseError(line, `${right} is not an expression`)}
        if( !(op instanceof Token) ){parseError(line, `${right} is not a token`)}

        this.left = left
        this.op = op
        this.right = right
        this.line = line
    }

    [util.inspect.custom]() {
        return `Binary (${this.op.lexeme }, ${this.left}, ${this.right})`;
    }
    toString(){
        return `Binary (${this.op.lexeme }, ${this.left}, ${this.right})`;
    }
}

export class Unary extends Expr{
    constructor(op, right, line){
        super()
        if( !(right instanceof Expr) ){parseError(line, `${right} is not an expression`)}
        if( !(op instanceof Token) ){parseError(line, `${right} is not a token`)}

        this.op = op
        this.right = right
        this.line = line
    }

    [util.inspect.custom]() {
        return `Unary (${this.op.lexeme }, ${this.right})`;
    }
    toString(){
        return `Unary (${this.op.lexeme }, ${this.right})`;
    }
}

export class Bool extends Expr{
    constructor(value, line){
        super()
        if( ![true, false].includes(value) ){parseError(line, `${value} is not a boolean`)}
        this.line = line
        this.value = value
    }

    [util.inspect.custom]() {
        return `Bool [${this.value}]`;
    }
    toString(){
        return `Bool [${this.value}]`;
    }
}

export class Null extends Expr{
    constructor(value, line){
        super()
        if( !(value != null) ){parseError(line, `${value} is not a null`)}

        this.line = line
        this.value = value
    }

    [util.inspect.custom]() {
        return `Null [${this.value}]`;
    }
    toString(){
        return `Null [${this.value}]`;
    }
}

export class String extends Expr{
    constructor(value, line){
        super()
        if( !(typeof value == 'string') ){parseError(line, `${value} is not a string`)}

        this.line = line
        this.value = value
    }


    [util.inspect.custom]() {
        return `String [${this.value}]`;
    }
    toString(){
        return `String [${this.value}]`;
    }
}


export class Number extends Expr{
    constructor(value, line){
        super()
        if( !(typeof value == 'string') ){parseError(line, `${value} is not a string`)}

        this.line = line
        this.value = value
    }


    [util.inspect.custom]() {
        return `Number [${this.value}]`;
    }
    toString(){
        return `Number [${this.value}]`;
    }
}

export class Grouping extends Expr{
    constructor(value, line){
        super()
        if( !(value instanceof Expr) ){parseError(line, `${value} is not an expression`)}

        this.line = line
        this.value = value
    }

    [util.inspect.custom]() {
        return `Grouping (${this.value})`;
    }
    toString(){
        return `Grouping (${this.value})`;
    }
}
