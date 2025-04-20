// expression     → equality ;
// equality       → comparison ( ( "!=" | "==" ) comparison )* ;
// comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
// term           → factor ( ( "-" | "+" ) factor )* ;
// factor         → unary ( ( "/" | "*" ) unary )* ;
// unary          → ( "!" | "-" ) unary
//                | primary ;
// primary        → NUMBER | STRING | "true" | "false" | "nil"
//                | "(" expression ")" ;

import * as TOKENS from './tokens.js'
import * as ASTNode from './ASTNodes.js'
import { parseError } from './utils.js';

export default class Parser{
    constructor(tokens){
        this.tokens = tokens
        this.current = 0
    }

    match(types){
        for(let i = 0; i < types.length; i++ ){
            if(this.check(types[i])){
                this.advance()
                return true
            }
        }
        return false
    }
    
    consume(type, message){
        if(this.check(type)){
            return this.advance()
        }

        parseError(this.peek().line, message);
    }

    check(type){
        if(this.isAtEnd()){
            return false
        }
        return this.peek().type == type
    }

    advance(){
        if(!this.isAtEnd()){
            this.current += 1
        }
        return this.previous()
    }

    isAtEnd() {
        return this.peek().type == TOKENS.EOF;
    }
    
    peek() {
        return this.tokens[this.current];
    }
    
    previous() {
        return this.tokens[this.current - 1];
    }

    primary() {
        if (this.match([TOKENS.FALSE])){
            return new ASTNode.Bool(false, this.previous().line);
        }else if (this.match([TOKENS.TRUE])){
            return new ASTNode.Bool(true, this.previous().line);
        }else if (this.match([TOKENS.NIL])){
            return new ASTNode.Null(null, this.previous().line);
        }else if (this.match([TOKENS.STRING])){
            let lexeme = this.previous().lexeme
            lexeme = lexeme.slice(1, lexeme.length - 1)
            return new ASTNode.String(lexeme, this.previous().line);
        }else if (this.match([TOKENS.NUMBER])){
            return new ASTNode.Number(this.previous().lexeme, this.previous().line);
        }
        else if (this.match([TOKENS.LEFT_PAREN])) {
          let expr = this.expression();
          this.consume(TOKENS.RIGHT_PAREN, "Expect ')' after expression");
          return new ASTNode.Grouping(expr);
        }
      }

    unary() {
        if (this.match([TOKENS.BANG, TOKENS.MINUS])) {
          let operator = this.previous();
          let right = this.unary();
          return new ASTNode.Unary(operator, right, operator.line);
        }
    
        return this.primary();
    }

    factor() {
        let expression = this.unary()

        while(this.match([TOKENS.STAR, TOKENS.SLASH])){
            let operator = this.previous()
            let right = this.unary()
            expression = new ASTNode.Binary(expression, operator, right, operator.line)
        }

        return expression
    }

    term() {
        let expression = this.factor()

        while(this.match([TOKENS.MINUS, TOKENS.PLUS])){
            let operator = this.previous()
            let right = this.factor()
            expression = new ASTNode.Binary(expression, operator, right, operator.line)
        }

        return expression
    }

    comparison() {
        let expression = this.term()

        while( this.match([TOKENS.GREATER, TOKENS.GREATER_EQUAL, TOKENS.LESS, TOKENS.LESS_EQUAL]) ){
            let operator = this.previous()
            let right = this.term()
            expression = new ASTNode.Binary(expression, operator, right, operator.line)
        }

        return expression
    }

    equality(){
        let expression = this.comparison()
        
        while( this.match([TOKENS.BANG_EQUAL, TOKENS.EQUAL_EQUAL]) ){
            let operator = this.previous()
            let right = this.comparison()
            expression = new ASTNode.Binary(expression, operator, right, operator.line)
        }

        return expression
    }

    expression(){
        return this.equality()
    }

    program(){
        let expression = this.expression()
        return expression
    }

    parse(){
        let ast = this.program()
        return ast
    }
}   