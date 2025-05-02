import * as TYPES from  './types.js'
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

export function formattedDatatype(dataType){
    let [type, val] = dataType

    if(type == TYPES.TYPE_NUMBER){
        process.stdout.write(CYAN)
        process.stdout.write(val.toString())
        return
    }

    if(type == TYPES.TYPE_STRING){
        process.stdout.write(YELLOW)
        process.stdout.write('"')
        process.stdout.write(val.toString())
        process.stdout.write('"')
        return
    }

    if(type == TYPES.TYPE_BOOL){
        process.stdout.write(GREEN)
        process.stdout.write(val.toString())
        return
    }

    if(type == TYPES.TYPE_NULL){
        process.stdout.write(RED)
        process.stdout.write('null')
        return
    }
    
    if(type == TYPES.TYPE_ARRAY){
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
    if(type == TYPES.TYPE_MAP){
        process.stdout.write(WHITE)
        process.stdout.write('{')

        let mapKeys = val.keyOrder
        let map = val.structure

        for(let i = 0; i < mapKeys.length; i++){
            let keyVal = mapKeys[i][1]

            formattedDatatype(map[keyVal].key)
            process.stdout.write(WHITE)
            process.stdout.write(" : ")
            formattedDatatype(map[keyVal].value)

            if(i != mapKeys.length - 1){
                process.stdout.write(WHITE)
                process.stdout.write(', ')
            }
        }

        process.stdout.write(WHITE)
        process.stdout.write('}')
    }
}