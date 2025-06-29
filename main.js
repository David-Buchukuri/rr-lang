import Lexer from './lexer.js'
import Parser from './parser.js'
import Interpreter from './interpreter.js'
import { printAST } from './utils.js'
import fs from 'fs';


if(process.argv.length <= 2){
    console.error('Error: File path not provided');
    process.exit(1);
}

const filePath = process.argv[2];

if(!fs.existsSync(filePath)){
    console.error(`Error: File "${filePath}" does not exist.`);
    process.exit(1);
}

const srcCode = fs.readFileSync(filePath, 'utf8');

let lexer = new Lexer(srcCode);
let tokens = lexer.lexTokens();
// console.log(tokens)
// console.log("\n")

let parser = new Parser(tokens)
let statements = parser.parse()
// printAST(statements)
// console.log("\n")

let interpreter = new Interpreter()
interpreter.interpretAst(statements)
