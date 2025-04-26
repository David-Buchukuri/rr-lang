export const LEFT_PAREN = 'LEFT_PAREN' 
export const RIGHT_PAREN = 'RIGHT_PAREN'
export const LEFT_BRACE = 'LEFT_BRACE'
export const RIGHT_BRACE = 'RIGHT_BRACE'
export const LEFT_BRACKET = 'LEFT_BRACKET'
export const RIGHT_BRACKET = 'RIGHT_BRACKET'
export const COMMA = 'COMMA' 
export const MINUS = 'MINUS' 
export const PLUS = 'PLUS' 
export const SEMICOLON = 'SEMICOLON' 
export const SLASH = 'SLASH' 
export const STAR = 'STAR' 

export const BANG = 'BANG'
export const BANG_EQUAL = 'BANG_EQUAL'
export const EQUAL = 'EQUAL'
export const EQUAL_EQUAL = 'EQUAL_EQUAL'
export const GREATER = 'GREATER'
export const GREATER_EQUAL = 'GREATER_EQUAL'
export const LESS = 'LESS'
export const LESS_EQUAL = 'LESS_EQUAL'

export const IDENTIFIER = 'IDENTIFIER'
export const STRING = 'STRING'
export const NUMBER = 'NUMBER'

export const AND ='AND'
export const ELSE ='ELSE'
export const FALSE ='FALSE'
export const FUN ='FUN'
export const FOR ='FOR'
export const IF ='IF'
export const NULL ='NULL'
export const OR ='OR'

export const PRINT = 'PRINT' 
export const RETURN = 'RETURN' 
export const TRUE = 'TRUE' 
export const VAR = 'VAR' 
export const WHILE = 'WHILE' 

export const EOF = 'EOF'

import util from 'util';

export class Token{
    constructor(type, lexeme, line){
        this.type = type
        this.lexeme = lexeme
        this.line = line
    }

    [util.inspect.custom]() {
        return `{ ${this.type  }} { ${this.lexeme} } line:${ this.line }}`;
    }

    toString() {
        return `{ ${this.type} } { ${this.lexeme} } line:${ this.line }`;
    }
}