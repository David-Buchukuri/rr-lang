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
//     print(b);
    
//     b[0] = [67, "abc"];
//     print(b);
    
//     b[0][1] = 7;
//     print(b);
    
//     b[0] = 9;
//     print(b);
    
//     b[1] = [1, null, [3, [1, 2, true, "abc", 1]]];
//     print(b);

//     b[0] = 0;
//     b[1] = 1;
//     b[2] = 2;

//     print(b[1 + 1]);
//     print(b);
// `

// let srcCode = `
//     b = [1, 2, [3, 4]];
//     c = [];
//     a = 1;
    
//     print(b[a]);

//     if(false){
//     }else{
//         a = "apple";
//     }
//     print(a);
//     b[2][1];
//     print(b[2][1]);
// `

// let srcCode = `
//     print "start loop";
//     i = 0;
//     while(i < 5){
//         print "hello";
//         i = i + 1;
//     }
//     print null;
// `

// let srcCode = `
//     func func1(a, b, c){
//         print a + b;
//         if(a > b){
//             print (b);
//         }
//     }
// `

// let srcCode = `
//     b = 9;

//     func test1(a){
//         while(true){
//             if(true){
//                 print("deep return");
//                 return 5;
//             }
//         }

//         print("should not print");
//     }

//     func test(){
//         print(test1(true));
//         print("logged test 1");
//         return b;
//         print("logged test 2");
//     }

//     func fib(){
//         return test();
//     }
    
//     print(fib());
// `



// let srcCode = `
//     b = [1, 2, [3, 4]];
//     arr_push(b[2], [1,2,3]);
//     print(b);
//     arr_push(b[2][2], "hello");
//     print(b);
//     arr_push(b, "text", 2);
//     print(b);
// `

// -------------------------
// let srcCode = `
//     less = [];
//     more = [];
//     arr = [1, 2, 3, 4, 5, 6];
//     i = 0;

//     while(i < arr_length(arr)){
//         if(arr[i] < 3){
//             arr_push(less, arr[i]);
//         }else{
//             arr_push(more, arr[i]);
//         }
//         i = i + 1;
//     }

//     print("less");
//     print(less);
//     print("more");
//     print(more);
// `

// let srcCode = `
//     func fib(a){
//         if(a <= 1){
//             return a;
//         }
//         return fib(a - 1) + fib(a - 2);
//     }

//     print(fib(15));
// `


// let srcCode = `
//     i = 0;
//     arr = [];
//     while(i < 5){
//         arr_push(arr, i);
//         i = i + 1;
//     }

//     while(arr_length(arr) != 0){
//         print(arr_pop(arr));
//     }
// `
// let srcCode = `
//     arr = [1, 2, 3, 4, 5];
//     poppedElem = arr_pop(arr, 3);
//     print(arr);
//     print(poppedElem);
// `
// let srcCode = `
//     a = 9;
//     elems = [1, 2, 3, null, 4, a, ["hello", "world"]];

//     for(elem in elems){
//         print("for block");
//         print(elem);
//         print("-----");
//     }else{
//         print("else block");
//         print(elem);
//         print("-----");
//     }
// `
// let srcCode = `
//     arr1 = [1,2,3];
//     arr2 = arr1;
    
//     arr_push(arr2, 4);
//     arr_pop(arr2, 0);

//     print(arr1);
//     print(arr2);
// `
// let srcCode = `
//     arr = [
//         1, 
//         2, 
//         {
//             "tree": ["leaves", "root", 7, [1, {"jondex": 9}]],
//             1: 99
//         }
//     ];

//     map = { 2: "val", -6: [1,2,"hey"], 30: arr };

//     print(
//         arr[2]["tree"][3][1]["jondex"] + map[-6][1] + map[30][2]["tree"][2]
//     );

//     print(
//         map["cxeni"]
//     );
// `
// let srcCode = `
//     map = {"nums": [0,1]};
    
//     map[null] = 5;
//     print(map);

//     map["nums"] = {1: 2};
//     print(map);
    
//     map["nums"] = {1: 2};   
//     map[1] = 999;
    
//     func str(){
//         return "array";
//     }
    
//     map["my-" + str()] = [1,2,null,4];
//     for(elem in map["my-array"]){
//         print("----");
//         print("for");
//         print(elem);
//     }else{
//         print("----");
//         print("else");
//         print(elem);
//     }
//     print(map);
// `
// let srcCode = `
//     map = {"nums": [0,1], "map": {"key": "value"}, null: "null value", 3.5: 355};
//     map["hello"] = {};
//     map[7] = 77;

//     for(key in map_keys(map)){
//         print(key);
//         print(map[key]);
//         print("---");
//     }
// `
// let srcCode = `
//     map = {"nums": [0,1], "map": {"key": "value"}, null: "null value", 3.5: 355};
//     print(map);
//     print(map_keys(map));

//     map_del(map, null);
   
//     print(map);
//     print(map_keys(map));
   
//     map_del(map, 3.5);
   
//     print(map);
//     print(map_keys(map));
// `
let srcCode = `
    res = -55 % 10 % 3 + 5;
    print(res);
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
interpreter.interpretAst(statements)
