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

export function printAST(ast){
    let astText = ast.toString()

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