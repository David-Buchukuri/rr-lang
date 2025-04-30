/*
program        → statements EOF ;
statements     → statement*;

statement      → exprStmt
               | arrayElementAssignmentStmt
               | standardAssignmentStmt
               | ifStmt
               | whileStmt
               | functionDeclarationStmt
               | returnStmt;
               

standardAssignmentStmt       → IDENTIFIER "=" expression ";" ;
arrayElementAssignmentStmt   → arrayAccess "=" expression ";" ;
exprStmt                     → expression ";" ;
ifStmt                       → "if" "(" expression ")" "{" statements? "}" ;
                               ("else" "{" statements? "}")? ;
whileStmt                    → "while" "(" expression ")" "{" statements? "}" ;
functionDeclarationStmt      → "func" IDENTIFIER "(" IDENTIFIER? ("," IDENTIFIER)* ")" "{" statements? "}" ;
returnStmt                   → "return" expression? ";" ; 

---
expression     → logicOr ;
logicOr        → logicAnd ("or" logicAnd)* ;
logicAnd       → equality ("and" equality)* ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary | arrayAccession ;
arrayAccession → arrayAccess | primary ;
primary        → NUMBER | STRING | "true" | "false" | "null"
               | "(" expression ")" | functionCall | IDENTIFIER | arrayLiteral;

--- helpers ---
arrayLiteral = "[" expression? (, expression)* "]"
arrayAccess  = ( IDENTIFIER ( "[" expression "]" )+ )
functionCall =  IDENTIFIER "(" expression? ("," expression)* ")"
*/


import * as TOKENS from './tokens.js'
import * as ASTNode from './ASTNodes.js'
import { parseError, runtimeError } from './utils.js';
import { globalFunctions } from './globalFunctions.js'

export default class Parser{
    functionTrackingStack = []

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
            let identifier = this.previous().lexeme

            if( this.match([TOKENS.LEFT_PAREN]) ){
                let args = []

                if( !this.match([TOKENS.RIGHT_PAREN]) ){
                    args.push(this.expression())
                    while(this.match([TOKENS.COMMA])){
                        args.push(this.expression())
                    }
                    this.consume(TOKENS.RIGHT_PAREN, "Expect ) at the end of the function call")
                }

                return new ASTNode.FunctionCall(identifier, args, this.previous().line);
            }else{   
                return new ASTNode.Identifier(identifier, this.previous().line);
            }
        }
        else if (this.match([TOKENS.NUMBER])){
            return new ASTNode.Number(this.previous().lexeme, this.previous().line);
        }
        else if (this.match([TOKENS.LEFT_PAREN])) {
            let expr = this.expression();
            this.consume(TOKENS.RIGHT_PAREN, "Expect ')' after expression");
            return new ASTNode.Grouping(expr, this.previous().line);
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

    logicalAnd(){
        let expression = this.equality()
        
        while( this.match([TOKENS.AND]) ){
            let operator = this.previous()
            let right = this.equality()
            expression = new ASTNode.LogicalAnd(expression, operator, right, operator.line)
        }

        return expression
    }

    logicalOr(){
        let expression = this.logicalAnd()
        
        while( this.match([TOKENS.OR]) ){
            let operator = this.previous()
            let right = this.logicalAnd()
            expression = new ASTNode.LogicalOr(expression, operator, right, operator.line)
        }

        return expression
    }

    expression(){
        return this.logicalOr()
    }

    expressionStmt(){
        let line = this.peek().line
        let expression = this.expression();
        this.consume(TOKENS.SEMICOLON, "Expect ';' after expression");
        return new ASTNode.ExpressionStmt(expression, line);
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

    ifStatement(){
        let line = this.advance().line
        this.consume(TOKENS.LEFT_PAREN, 'Expect ( before if condition')
        let expr = this.expression()
        this.consume(TOKENS.RIGHT_PAREN, 'Expect ) after if condition')
        this.consume(TOKENS.LEFT_BRACE, 'Expect { after if statement')

        // handle empty if statement
        let ifStatements = []
        if(!this.match([TOKENS.RIGHT_BRACE])){
            ifStatements = this.statements()
            this.consume(TOKENS.RIGHT_BRACE, 'Expect } after if statement')
        }

        let elseStatements = []
        if(this.match([TOKENS.ELSE])){
            this.consume(TOKENS.LEFT_BRACE, 'Expect { after else')

            if(!this.match([TOKENS.RIGHT_BRACE])){
                elseStatements = this.statements()
                this.consume(TOKENS.RIGHT_BRACE, 'Expect } after else')
            }
        }

        return new ASTNode.IfStmt(expr, ifStatements, elseStatements, line)
    }

    whileStatement(){
        let line = this.advance().line
        this.consume(TOKENS.LEFT_PAREN, 'Expect ( before while condition')
        let expr = this.expression()
        this.consume(TOKENS.RIGHT_PAREN, 'Expect ) after while condition')
        this.consume(TOKENS.LEFT_BRACE, 'Expect { after while statement')

        // handle empty while statement
        let whileStatements = []
        if(!this.match([TOKENS.RIGHT_BRACE])){
            whileStatements = this.statements()
            this.consume(TOKENS.RIGHT_BRACE, 'Expect } after while statement')
        }

        return new ASTNode.WhileStmt(expr, whileStatements, line)
    }

    functionDeclarationStmt(){
        this.functionTrackingStack.push(1)

        let line = this.advance().line
        let funcIdentifier = this.consume(TOKENS.IDENTIFIER, 'Expect identifier after the func keyword')
        if(globalFunctions.includes(funcIdentifier.lexeme)){
            runtimeError(line, `User defined functions can't have names of the global functions, ${funcIdentifier.lexeme}`);
        }

        this.consume(TOKENS.LEFT_PAREN, 'Expect opening ( after the function identifier')

        let parameters = []
        if(!this.check(TOKENS.RIGHT_PAREN)){
            parameters.push(
                this.consume(TOKENS.IDENTIFIER, 'Expect identifier in the function parameters list')
            )
          
            while(this.match([TOKENS.COMMA])){
                parameters.push(
                    this.consume(TOKENS.IDENTIFIER, 'Expect identifier in the function parameters list')
                )
            }
        }
        
        this.consume(TOKENS.RIGHT_PAREN, 'Expect closing ) after the function arguments list')
        this.consume(TOKENS.LEFT_BRACE, 'Expect opening { before the the function body')

        // handle empty function declaration
        let functionStatements = []
        if(!this.match([TOKENS.RIGHT_BRACE])){
            functionStatements = this.statements()
            this.consume(TOKENS.RIGHT_BRACE, 'Expect closing } after the the function body')
        }

        this.functionTrackingStack.pop(1)
        return new ASTNode.FunctionDeclarationStmt(funcIdentifier, parameters, functionStatements, line)
    }

    returnStmt(){
        let line = this.advance().line

        if(!this.functionTrackingStack.length){
            parseError(line, "Can't have return statements outside of functions");
        }

        let expr = new ASTNode.Null(null, line);
        if(!this.match([TOKENS.SEMICOLON])){
            expr = this.expression()
            this.consume(TOKENS.SEMICOLON, "Expect ';' after expression");
        }

        return new ASTNode.ReturnStmt(expr, line)
    }

    statement() {
        if(this.check(TOKENS.IF)){
            return this.ifStatement();
        }

        if(this.check(TOKENS.WHILE)){
            return this.whileStatement();
        }

        if(this.check(TOKENS.FUNC)){
            return this.functionDeclarationStmt();
        }

        if(this.check(TOKENS.RETURN)){
            return this.returnStmt();
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
        let line = this.peek().line

        while(!this.isAtEnd() && !this.check(TOKENS.RIGHT_BRACE)){
            statements.push(this.statement())
        }

        statements = new ASTNode.Stmts(statements, line)

        return statements
    }

    parse(){
       return this.statements()
    }
}   