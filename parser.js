/*
program        → statements EOF ;
statements     → statement*;

statement      → exprStmt
               | printStmt
               | arrayElementAssignmentStmt
               | standardAssignmentStmt;
               

standardAssignmentStmt       → IDENTIFIER "=" expression ";" ;
arrayElementAssignmentStmt   → arrayAccess "=" expression ";" ;
exprStmt                     → expression ";" ;
printStmt                    → "print" expression ";" ;

---
expression     → equality ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary | arrayAccession ;
arrayAccession → arrayAccess | primary
primary        → NUMBER | STRING | "true" | "false" | "null"
               | "(" expression ")" | IDENTIFIER | arrayLiteral;

--- helpers ---
arrayLiteral = "[" expression? (, expression)* "]"
arrayAccess = ( IDENTIFIER ( "[" expression "]" )+ )
*/


import * as TOKENS from './tokens.js'
import * as ASTNode from './ASTNodes.js'
import { parseError } from './utils.js';

export default class Parser{
    constructor(tokens){
        this.tokens = tokens
        this.current = 0
    }

    isEqualAhead(){
        for(let i = this.current; i < this.tokens.length; i++){
            if(this.tokens[i].type == TOKENS.SEMICOLON){return false;}
            if(this.tokens[i].type == TOKENS.EQUAL){return true;}
        }
        return false;
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

    checkNext(type){
        if(this.isAtEnd()){
            return this.peek().type == type
        }
        return this.tokens[this.current + 1].type == type
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
        }
        else if (this.match([TOKENS.TRUE])){
            return new ASTNode.Bool(true, this.previous().line);
        }
        else if (this.match([TOKENS.NULL])){
            return new ASTNode.Null(null, this.previous().line);
        }
        else if (this.match([TOKENS.STRING])){
            let lexeme = this.previous().lexeme
            lexeme = lexeme.slice(1, lexeme.length - 1)
            return new ASTNode.String(lexeme, this.previous().line);
        }
        else if (this.match([TOKENS.IDENTIFIER])){
            return new ASTNode.Identifier(this.previous().lexeme, this.previous().line);
        }
        else if (this.match([TOKENS.NUMBER])){
            return new ASTNode.Number(this.previous().lexeme, this.previous().line);
        }
        else if (this.match([TOKENS.LEFT_PAREN])) {
            let expr = this.expression();
            this.consume(TOKENS.RIGHT_PAREN, "Expect ')' after expression");
            return new ASTNode.Grouping(expr);
        }
        else if(this.match([TOKENS.LEFT_BRACKET])){
            let line = this.previous().line
            if(this.match([TOKENS.RIGHT_BRACKET])){         // empty array case
                return new ASTNode.ArrayLiteral([], line);
            }

            let expressions = [this.expression()];
            while(this.match([TOKENS.COMMA])){
                expressions.push(this.expression())
            }
            this.consume(TOKENS.RIGHT_BRACKET, 'Expect ] at the end of the array')
            return new ASTNode.ArrayLiteral(expressions, line);
        }
      }

    arrayAccession(){
        if(this.check(TOKENS.IDENTIFIER) && this.checkNext(TOKENS.LEFT_BRACKET)){
            let identifierToken = this.advance()
            let identifier = identifierToken.lexeme
            let line = identifierToken.line

            let indexAccessions = []

            while(this.match([TOKENS.LEFT_BRACKET])){
                indexAccessions.push(this.expression())
                this.consume(TOKENS.RIGHT_BRACKET, 'Expect ] after array index accession')
            }

            return new ASTNode.ArrayAccession(identifier, indexAccessions, line)
        }

        return this.primary()
    }

    unary() {
        if (this.match([TOKENS.BANG, TOKENS.MINUS])) {
          let operator = this.previous();
          let right = this.unary();
          return new ASTNode.Unary(operator, right, operator.line);
        }
    
        return this.arrayAccession();
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

    printStatement(){
        let expression = this.expression();
        this.consume(TOKENS.SEMICOLON, "Expect ';' after expression");
        return new ASTNode.PrintStmt(expression);
    }

    expressionStmt(){
        let expression = this.expression();
        this.consume(TOKENS.SEMICOLON, "Expect ';' after expression");
        return new ASTNode.ExpressionStmt(expression);
    }

    standardAssignmentStmt(){
        let currentToken = this.consume(TOKENS.IDENTIFIER, 'Expect identifier') 
        let identifier = currentToken.lexeme
        let line = currentToken.line

        this.consume(TOKENS.EQUAL, 'Expect = after identifier') 

        let expression = this.expression()

        this.consume(TOKENS.SEMICOLON, 'Expect ; after assignment')

        return new ASTNode.StandardAssignmentStmt(identifier, expression, line)
    }

    arrayElementAssignmentStmt(){
        let identifierToken = this.advance()
        let identifier = identifierToken.lexeme
        let line = identifierToken.line

        let indexExpressions = []

        while(this.match([TOKENS.LEFT_BRACKET])){
            indexExpressions.push(this.expression())
            this.consume(TOKENS.RIGHT_BRACKET, 'Expect ] after array index accession')
        }

        this.consume(TOKENS.EQUAL, 'Expect = after array element assignment')
        let value = this.expression()

        this.consume(TOKENS.SEMICOLON, 'Expect ; after assignment')
        return new ASTNode.ArrayElementAssignmentStmt(identifier, indexExpressions, value, line)
    }

    statement() {
        if (this.match([TOKENS.PRINT])){
            return this.printStatement();
        }

        if(this.check(TOKENS.IDENTIFIER)){
            if(
                this.checkNext(TOKENS.LEFT_BRACKET) &&
                this.isEqualAhead()
            ){
                return this.arrayElementAssignmentStmt()
            }
            else if(this.checkNext(TOKENS.EQUAL)){
                return this.standardAssignmentStmt()
            }
        }

        return this.expressionStmt();
    }

    statements(){
        let statements = []

        while(!this.isAtEnd()){
            statements.push(this.statement())
        }

        statements = new ASTNode.Stmts(statements)

        return statements
    }

    parse(){
       return this.statements()
    }
}   