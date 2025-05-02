import * as TOKENS from  './tokens.js'
import { Token } from './tokens.js'
import { lexError } from './utils.js'


class Lexer{
    keywords = {
        'and'    : TOKENS.AND,
        'else'   : TOKENS.ELSE,
        'false'  : TOKENS.FALSE,
        'func'   : TOKENS.FUNC,
        'if'     : TOKENS.IF,
        'null'   : TOKENS.NULL,
        'or'     : TOKENS.OR,
        'return' : TOKENS.RETURN,
        'true'   : TOKENS.TRUE,
        'while'  : TOKENS.WHILE,
        'for'    : TOKENS.FOR,
        'in'     : TOKENS.IN,
    }

    constructor(sourceCode){
        this.sourceCode = sourceCode
        this.tokens = []
        this.start = 0
        this.current = 0
        this.line = 1
    }

    lexTokens(){
        while(!this.isAtEnd()){
            this.scanToken()
            this.start = this.current    
        }

        this.tokens.push(
            new Token(TOKENS.EOF, "", this.line)
        )

        return this.tokens
    }

    scanToken(){
        let char = this.advance()
        
        if(char == '('){
            this.addToken(TOKENS.LEFT_PAREN)
        }
        else if(char == ')'){
            this.addToken(TOKENS.RIGHT_PAREN)
        }
        else if(char == '{'){
            this.addToken(TOKENS.LEFT_BRACE)
        }
        else if(char == '}'){
            this.addToken(TOKENS.RIGHT_BRACE)
        }
        else if(char == '['){
            this.addToken(TOKENS.LEFT_BRACKET)
        }
        else if(char == ']'){
            this.addToken(TOKENS.RIGHT_BRACKET)
        }
        else if(char == ','){
            this.addToken(TOKENS.COMMA)
        }
        else if(char == '.'){
            this.addToken(TOKENS.DOT)
        }
        else if(char == '-'){
            this.addToken(TOKENS.MINUS)
        }
        else if(char == '+'){
            this.addToken(TOKENS.PLUS)
        }
        else if(char == '*'){
            this.addToken(TOKENS.STAR)
        }
        else if(char == ';'){
            this.addToken(TOKENS.SEMICOLON)
        }
        else if(char == ':'){
            this.addToken(TOKENS.COLON)
        }
        else if(char == '>'){
            if(this.currEqual('=')){
                this.addToken(TOKENS.GREATER_EQUAL)
            }else{
                this.addToken(TOKENS.GREATER)
            }
        }
        else if(char == '<'){
            if(this.currEqual('=')){
                this.addToken(TOKENS.LESS_EQUAL)
            }else{
                this.addToken(TOKENS.LESS)
            }
        }
        else if(char == '!'){
            if(this.currEqual('=')){
                this.addToken(TOKENS.BANG_EQUAL)
            }else{
                this.addToken(TOKENS.BANG)
            }
        }
        else if(char == '='){
            if(this.currEqual('=')){
                this.addToken(TOKENS.EQUAL_EQUAL)
            }else{
                this.addToken(TOKENS.EQUAL)
            }
        }
        else if(char ==  '/'){
            if (this.currEqual('/')){
                while(!this.isAtEnd() && this.peek() != "\n"){
                    this.advance()
                }
            }
            else{
                this.addToken(TOKENS.SLASH)
            }
        }
        else if( [" ", "\t", "\r"].includes(char) ){
            // continue;
        }
        else if(char == "\n"){
            this.line += 1
        }
        else if(char == '"'){
            this.addStringToken()
        }else{
            if( this.isDigit(char) ){
                this.addNumberToken()
            }
            else if( this.isAlpha(char) ){
                this.addIdentifierToken()
            }else{
                lexError(this.line, `unexpected character ${char}`)
            }
        }
    }

    advance(){
        let char = this.sourceCode[this.current]
        this.current += 1
        return char
    }

    addToken(type){
        let text = this.sourceCode.slice(this.start,this.current)
        let token = new Token(type, text, this.line)
        this.tokens.push(token)
    }
    
    addStringToken(){
        while(!this.isAtEnd() && this.peek() != '"'){
            if(this.sourceCode[this.current] == "\n"){
                this.line += 1
            }
            this.advance()
        }
        
        if(this.isAtEnd()){
            lexError(this.line, "Missing closing quote for the string literal")
            return
        }

        this.advance()
        
        let value = this.sourceCode.slice(this.start + 1, this.current - 1)
        this.addToken(TOKENS.STRING , value)
    }

    addNumberToken(){
        while( this.isDigit(this.peek()) ){
            this.advance()
        }

        if( this.peek() == "." && this.isDigit(this.peekNext()) ){
            this.advance()
            while( this.isDigit(this.peek()) ){
                this.advance()
            }
        }

        
        let value = parseFloat(this.sourceCode.slice(this.start, this.current))
        this.addToken(TOKENS.NUMBER, value)
    }

    addIdentifierToken(){
        while( this.isAlphaNumeric(this.peek()) ){
            this.advance()
        }
        
        let text = this.sourceCode.slice(this.start, this.current)
        
        let type;
        if(this.keywords[text]){
            type = this.keywords[text]
        }
        else{
            type = TOKENS.IDENTIFIER
        }
        
        this.addToken(type)
    }

    isAlpha(char){
        if(char >= 'a' && char <= 'z'){
            return true
        }
        if(char >= 'A' && char <= 'Z'){
            return true
        }
        if(char == '_'){
            return true
        }
        return false
    }

    isDigit(char) {
        return char >= '0' && char <= '9';
    }

    isAlphaNumeric(char){
        if(this.isDigit(char) || this.isAlpha(char)){
            return true
        }
        return false
    }

    currEqual(expected){
        if(this.isAtEnd()){
            return false;
        }

        if(this.sourceCode[this.current] != expected){
            return false;
        }

        this.current += 1
        return true
    }

    peek(){
        if(this.isAtEnd()){
            return ""
        }

        return this.sourceCode[this.current]
    }

    peekNext(){
        if(this.current + 1 >= this.sourceCode.length){
            return ""
        }
        return this.sourceCode[this.current + 1]
    }

    isAtEnd(){
        if (this.current >= this.sourceCode.length){
            return true
        }

        return false
    }
}

export default Lexer