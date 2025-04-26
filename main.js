import Lexer from './lexer.js'
import Parser from './parser.js'
import Interpreter from './interpreter.js'
import { printAST } from './utils.js'

// let srcCode = `
//     4 == 1 - 2 * 3 / --2 != ("hey" + 2) >= 2 < 3 > "y";
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
// let srcCode = `
//     (1 / 2 + 3);
//     var1 = 2 / (3 + 1);
//     var1 = 7;
//     print 1 + 2 * var1 / 2;
// `
// let srcCode = `
//     var1 = [1, 2, (true == false), 2 > 3];
//     print 1 + 2 * var1 / 2;
// `
// let srcCode = `
//     var2[1][b[2]];
// `

// let srcCode = `
//     b = [67, "abc"];
//     a = [1, 2, 3, [5, 6, b]];
//     print a[3][2][1] + "edf" + "w";
//     c = [1, 2, 3, [5, 6, 7]];
//     print a;
// `

// let srcCode = `
//     b = [1, 2, [3, 4]];

//     b[0] = [67, "abc"];

//     b[0][1] = 7;

//     b[0] = 9;

//     b[1] = [1, null, [3, [1, 2, true, "abc", 1]]];

//     print b[1 + 1];
// `

let srcCode = `
    b = [1, 2, [3, 4]];
    c = [];
    a = 1;
    
    print b[a];

    if(false){
    }else{
        a = "apple";
    }
    print a;
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