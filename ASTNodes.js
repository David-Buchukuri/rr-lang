import { Token } from  './tokens.js'
import { parseError } from  './utils.js'
import util from 'util';


export class Expr{
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
        if( (value != null) ){parseError(line, `${value} is not a null`)}

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

export class Identifier extends Expr{
    constructor(value, line){
        super()
        if( !(typeof value == 'string') ){parseError(line, `${value} is not a string`)}

        this.line = line
        this.value = value
    }

    [util.inspect.custom]() {
        return `Identifier [${this.value}]`;
    }
    toString(){
        return `Identifier [${this.value}]`;
    }
}

export class ArrayLiteral extends Expr{
    constructor(values, line){
        super()
        for(let i = 0; i < values.length; i++){
            if( !(values[i] instanceof Expr) ){
                parseError(line, `${values[i]} is not an expression`)
            }
        }

        this.values = values
        this.line = line
    }

    [util.inspect.custom]() {
        return `ArrayLiteral (${this.values})`;
    }
    toString(){
        return `ArrayLiteral (${this.values})`;
    }
}

export class ArrayAccession extends Expr{
    constructor(identifier, values, line){
        super()
        for(let i = 0; i < values.length; i++){
            if( !(values[i] instanceof Expr) ){
                parseError(line, `${values[i]} is not an expression`)
            }
        }

        this.identifier = identifier
        this.values = values
        this.line = line
    }

    [util.inspect.custom]() {
        return `ArrayAccession (Identifier - ${this.identifier}, Indexes - (${this.values}))`;
    }
    toString(){
        return `ArrayAccession (Identifier - ${this.identifier}, Indexes - (${this.values}))`;
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

export class Stmt{
    constructor(){}
}

export class Stmts{
    constructor(stmts, line){
        for(let i = 0; i < stmts.length; i++){
            if( !(stmts[i] instanceof Stmt) ){
                parseError(line, `${stmts[i]} is not a statement`)
            }
        }
        this.stmts = stmts
        this.line = line
    }
    [util.inspect.custom]() {
        return `Stmts (${this.stmts})`;
    }
    toString(){
        return `Stmts (${this.stmts})`;
    }
}

export class ExpressionStmt extends Stmt{
    constructor(expression, line){
        super()
        if( !(expression instanceof Expr) ){parseError(line, `${expression} is not an expression`)}
        this.expression = expression
        this.line = line
    }
    
    [util.inspect.custom]() {
        return `ExpressionStmt (${this.expression})`;
    }
    toString(){
        return `ExpressionStmt (${this.expression})`;
    }
}

export class PrintStmt extends Stmt{
    constructor(expression, line){
        super()
        if( !(expression instanceof Expr) ){parseError(line, `${expression} is not an expression`)}
        this.expression = expression
        this.line = line
    }

    [util.inspect.custom]() {
        return `PrintStmt (${this.expression})`;
    }
    toString(){
        return `PrintStmt (${this.expression})`;
    }
}

export class StandardAssignmentStmt extends Stmt{
    constructor(identifier, value, line){
        super()
        if( !(value instanceof Expr) ){parseError(line, `${value} is not an expression`)}
        if( typeof identifier != 'string' ){parseError(line, `${identifier} is not a string`)}
        
        this.identifier = identifier
        this.value = value
        this.line = line
    }

    [util.inspect.custom]() {
        return `StandardAssignmentStmt (${this.identifier}, ${this.value})`;
    }
    toString(){
        return `StandardAssignmentStmt (${this.identifier}, ${this.value})`;
    }
}

export class ArrayElementAssignmentStmt extends Stmt{
    constructor(identifier, indexExpressions, value, line){
        super()
        for(let i = 0; i < indexExpressions.length; i++){
            if( !(indexExpressions[i] instanceof Expr) ){
                parseError(line, `${indexExpressions[i]} is not an expression`)
            }
        }
        if( !(value instanceof Expr) ){parseError(line, `${value} is not an expression`)}
        if( typeof identifier != 'string' ){parseError(line, `${identifier} is not a string`)}

        this.identifier = identifier
        this.indexExpressions = indexExpressions
        this.value = value
        this.line = line
    }

    [util.inspect.custom]() {
        return `ArrayElementAssignmentStmt (Identifier - ${this.identifier}, Indexes - (${this.indexExpressions}), Value - ${this.value})`;
    }
    toString(){
        return `ArrayElementAssignmentStmt (Identifier - ${this.identifier}, Indexes - (${this.indexExpressions}), Value - ${this.value})`;
    }
}

export class IfStmt extends Stmt{
    constructor(conditionExpr, ifStatements, elseStatements, line){
        super()
        if( !(conditionExpr instanceof Expr) ){
            parseError(line, `${conditionExpr} is not an expression`)
        }

        for(let i = 0; i < ifStatements.length; i++){
            if( !(ifStatements[i] instanceof Stmt) ){
                parseError(ifStatements[i]?.line ?? line, `${ifStatements[i]} is not a statement`)
            }
        }

        for(let i = 0; i < elseStatements.length; i++){
            if( !(elseStatements[i] instanceof Stmt) ){
                parseError(elseStatements[i]?.line ?? line, `${elseStatements[i]} is not a statement`)
            }
        }

        this.conditionExpr = conditionExpr
        this.ifStatements = ifStatements
        this.elseStatements = elseStatements
        this.line = line
    }

    [util.inspect.custom]() {
        return `IfStmt (Condition - ${this.conditionExpr}, If Branch - (${this.ifStatements}), Else Branch - (${this.elseStatements}))`;
    }
    toString(){
        return `IfStmt (Condition - ${this.conditionExpr}, If Branch - (${this.ifStatements}), Else Branch - (${this.elseStatements}))`;
    }
}
