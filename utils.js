export function lexError(line, message){
    let errorMessage = `line ${line}, error: ${message}`
    console.log("Lexing error")
    console.log(errorMessage)
    process.exit(1)
}

export function parseError(line, message){
    console.log("Parsing error")
    let errorMessage = `line ${line}, error: ${message}`
    console.log(errorMessage)
    process.exit(1)
}

export function runtimeError(line, message){
    console.log("Runtime error")
    let errorMessage = `line ${line}, error: ${message}`
    console.log(errorMessage)
    process.exit(1)
}

export function printAST(statements){
    let astText = statements.toString()

    let tabs = 0
    let currChars = []
    for(let i = 0; i < astText.length; i++){
        currChars.push(astText[i])


        if(astText[i] == ','){
            console.log(' '.repeat(tabs) + currChars.join('').trim())
            currChars = []
        }

        if(astText[i] == '('){
            console.log(' '.repeat(tabs) + currChars.join('').trim())
            currChars = []
            tabs += 4
        }

        if(astText[i] == ')'){
            currChars.pop()
            console.log(' '.repeat(tabs) + currChars.join('').trim())
            currChars = []

            tabs -= 4
            console.log(' '.repeat(tabs) + ')')
        }

    }
}

const TYPE_ARRAY = 'TYPE_ARRAY'
const TYPE_NUMBER = 'TYPE_NUMBER'
const TYPE_STRING = 'TYPE_STRING'  
const TYPE_BOOL   = 'TYPE_BOOL'
const TYPE_NULL   = 'TYPE_NULL'

let colorMap = {
    TYPE_ARRAY: "",
    TYPE_NUMBER: "",
    TYPE_STRING: "",
    TYPE_BOOL: "",
    TYPE_NULL: "",
}


export function formattedDatatype(dataType){
    let [type, val] = dataType

    if([TYPE_NUMBER, TYPE_STRING, TYPE_BOOL, TYPE_NULL].includes(type)){
        return val
    }

    let arrayElemVals = []

    if(type == TYPE_ARRAY){

        val.forEach(el => {
            arrayElemVals.push(formattedDatatype(el))
        })

    }

    return '[' + arrayElemVals.join(', ') + ']'
}