import Lexer from './lexer.js'
import Parser from './parser.js'
import Interpreter from './interpreter.js'
import { Token } from './tokens.js'
import { printAST } from './utils.js'

// let srcCode = `
//     var a = 7;
//     print("hello world")
//     0.4562
//     2 + 3 - 1
//     {}()*
//     for(var i = 1; i < 8; i++){
//         print(i)
//     }
//     while(l < 8){print(l)}
// `

// let srcCode = `
//     4 == 1 - 2 * 3 / --2 != ("hey" + 2) >= 2 < 3 > "y"
// `
// let srcCode = `
//     true == false
// `

// let srcCode = `
//     2 + 3 / 5 - (2 - 3 * 6)
// `
// let srcCode = `
//     (true == false) != true == true
// `
let srcCode = `
    print 3 - 2 == 7 * 2;
    print 1 + 2 * 4 / 2;
    2 + 3;
    (1 / 2 + 1);
`

let lexer = new Lexer(srcCode);
let tokens = lexer.lexTokens();
console.log(tokens)
console.log("\n")

let parser = new Parser(tokens)
let statements = parser.parse()
printAST(statements)
console.log("\n")

let interpreter = new Interpreter()
let result = interpreter.interpretAst(statements)
// console.log(result)


