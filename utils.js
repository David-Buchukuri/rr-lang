const WHITE  = "\x1b[0m"
const BLUE   = "\x1b[94m"
const CYAN   = "\x1b[96m"
const GREEN  = "\x1b[92m"
const YELLOW = "\x1b[93m"
const RED    = "\x1b[91m"

export function lexError(line, message){
    process.stdout.write(RED)
    let errorMessage = `line ${line}, error: ${message}`
    console.log("Lexing error")
    console.log(errorMessage)
    process.exit(1)
}

export function parseError(line, message){
    process.stdout.write(RED)
    console.log("Parsing error")
    let errorMessage = `line ${line}, error: ${message}`
    console.log(errorMessage)
    process.exit(1)
}

export function runtimeError(line, message){
    process.stdout.write(RED)
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

export function formattedDatatype(dataType){
    let [type, val] = dataType

    if(type == TYPE_NUMBER){
        process.stdout.write(CYAN)
        process.stdout.write(val.toString())
        return
    }

    if(type == TYPE_STRING){
        process.stdout.write(YELLOW)
        process.stdout.write('"')
        process.stdout.write(val.toString())
        process.stdout.write('"')
        return
    }

    if(type == TYPE_BOOL){
        process.stdout.write(GREEN)
        process.stdout.write(val.toString())
        return
    }

    if(type == TYPE_NULL){
        process.stdout.write(RED)
        process.stdout.write('null')
        return
    }
    
    if(type == TYPE_ARRAY){
        process.stdout.write(WHITE)
        process.stdout.write('[')

        for(let i = 0; i < val.length; i++){
            formattedDatatype(val[i])
            process.stdout.write(WHITE)
            if(i != val.length - 1){
                process.stdout.write(', ')
            }
        }

        process.stdout.write(WHITE)
        process.stdout.write(']')
    }
}