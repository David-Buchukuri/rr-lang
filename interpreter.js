import * as ASTNode from './ASTNodes.js'
import * as TOKENS from  './tokens.js'
import { runtimeError, formattedDatatype } from  './utils.js'
import Environment from  './environment.js'
import * as TYPES from  './types.js'
import { globalFunctions } from './globalFunctions.js'

class ReturnException {
    constructor(value) {
      this.value = value;
    }
  }

export default class Interpreter{
    interpretAst(statements){
        return this.interpret(statements, new Environment())
    }

    interpret(node, env){
        // expressions
        if(node instanceof ASTNode.Number){
            return [TYPES.TYPE_NUMBER, parseFloat(node.value)]
        }
        else if(node instanceof ASTNode.String){
            return [TYPES.TYPE_STRING, node.value]
        }
        else if(node instanceof ASTNode.Bool){
            return [TYPES.TYPE_BOOL, node.value]
        }
        else if(node instanceof ASTNode.Null){
            return [TYPES.TYPE_NULL, node.value]
        }
        else if(node instanceof ASTNode.Identifier){
            let variableName = node.value
            if(env.getVar(variableName)){
                return env.getVar(variableName)
            }
            runtimeError(node.line, `Undefined variable ${variableName}`)
        }
        else if(node instanceof ASTNode.ArrayLiteral){
            let arr = []
            for(let i = 0; i < node.values.length; i++){
                arr.push(this.interpret(node.values[i], env))
            }
            return [TYPES.TYPE_ARRAY, arr]
        }
        else if(node instanceof ASTNode.ArrayAccession){
            return this.accessArrayIndex(node.identifier, node.values, node.line, env)
        }
        else if(node instanceof ASTNode.FunctionCall){
            if( globalFunctions.includes(node.identifier) ){
                return this.InterpretGlobalFunction(node, env)
            }

            let func = env.getFunc(node.identifier)
            if(!func){
                runtimeError(node.line, `Function ${node.identifier} is not declared`);
            }

            if(func.parameters.length != node.args.length){
                runtimeError(node.line, `function ${node.identifier} expected ${func.parameters.length} argument(s), got ${node.args.length}`);
            }

            let newEnv = new Environment()
            newEnv.parent = env
            for(let i = 0; i < node.args.length; i++){
                newEnv.setVar(
                    func.parameters[i].lexeme,
                    this.interpret(node.args[i], env)
                )
            }

            try{
                this.interpret(func.statements, newEnv)
            }catch(err){
                if (err instanceof ReturnException) {
                    return err.value;
                } else {
                    throw err;
                }
            }

            return [TYPES.TYPE_NULL, null]
        }
        else if(node instanceof ASTNode.ReturnStmt){
            let result = this.interpret(node.expression, env)
            throw new ReturnException(result);
        }
        else if(node instanceof ASTNode.Grouping){
            return this.interpret(node.value, env)
        }
        else if(node instanceof ASTNode.Unary){
            let [type, val] = this.interpret(node.right, env)

            if(node.op.type == TOKENS.MINUS){
                if(type == TYPES.TYPE_NUMBER){
                    return [TYPES.TYPE_NUMBER, -1 * val]
                }else{
                    runtimeError(node.op.line, `An operand of ${node.op.lexeme} must be a number`)
                }
            }

            if(node.op.type == TOKENS.BANG){
                if(type == TYPES.TYPE_BOOL){
                    return [TYPES.TYPE_BOOL, !val]
                }else{
                    runtimeError(node.op.line, `An operand of ${node.op.lexeme} must be a boolean`)
                }
            }
        }
        else if(node instanceof ASTNode.Binary){
            let [leftType, leftVal] = this.interpret(node.left, env)
            let [rightType, rightVal] = this.interpret(node.right, env)
        
            if(node.op.type == TOKENS.PLUS){
                this.checkNumberAndStringOperands(leftType, rightType, node.op)
                return [leftType, leftVal + rightVal]
            } 
            else if(node.op.type == TOKENS.MINUS){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPES.TYPE_NUMBER, leftVal - rightVal]
            }   
            else if(node.op.type == TOKENS.SLASH){
                if(rightVal == 0){
                    runtimeError(`Division by zero`, node.op.line)
                }
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPES.TYPE_NUMBER ,leftVal / rightVal]
                
            }
            else if(node.op.type == TOKENS.STAR){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPES.TYPE_NUMBER, leftVal * rightVal]
            }
            else if(node.op.type == TOKENS.GREATER){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPES.TYPE_BOOL, leftVal > rightVal]
            }
            else if(node.op.type == TOKENS.GREATER_EQUAL){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPES.TYPE_BOOL, leftVal >= rightVal]
            }
            else if(node.op.type == TOKENS.LESS){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPES.TYPE_BOOL, leftVal < rightVal]
            }
            else if(node.op.type == TOKENS.LESS_EQUAL){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPES.TYPE_BOOL, leftVal <= rightVal]
            }
            else if(node.op.type == TOKENS.BANG_EQUAL){
                return [TYPES.TYPE_BOOL, leftVal != rightVal]
            }
            else if(node.op.type == TOKENS.EQUAL_EQUAL){
                return [TYPES.TYPE_BOOL, leftVal === rightVal]
            }
        }
        else if(node instanceof ASTNode.LogicalOr){
            let [leftType, leftVal] = this.interpret(node.left, env)
            if(leftType != TYPES.TYPE_BOOL){
                runtimeError(node.line, `Operands of logical or must be two booleans`)
            }
            if(leftVal){
                return [leftType, leftVal]
            }

            let [rightType, rightVal] = this.interpret(node.right, env)
            if(rightType != TYPES.TYPE_BOOL){
                runtimeError(node.line, `Operands of logical or must be two booleans`)
            }
            return [rightType, rightVal]
        }
        else if(node instanceof ASTNode.LogicalAnd){
            let [leftType, leftVal] = this.interpret(node.left, env)
            if(leftType != TYPES.TYPE_BOOL){
                runtimeError(node.line, `Operands of logical and must be two booleans`)
            }
            if(!leftVal){
                return [leftType, leftVal]
            }

            let [rightType, rightVal] = this.interpret(node.right, env)
            if(rightType != TYPES.TYPE_BOOL){
                runtimeError(node.line, `Operands of logical or must be two booleans`)
            }
            return [rightType, rightVal]
        }

        // statements
        else if(node instanceof ASTNode.ExpressionStmt){
            this.interpret(node.expression, env)
        }
        else if(node instanceof ASTNode.StandardAssignmentStmt){
            let value = this.interpret(node.value, env)
            env.setVar(node.identifier, value)
        }
        else if(node instanceof ASTNode.ArrayElementAssignmentStmt){
            let indexAccessionsLength = node.indexExpressions.length 
            let indexAccessions = node.indexExpressions
            let lastIndexAccession = indexAccessions.pop()

            let elemToChange;
            if(indexAccessionsLength > 1){
                elemToChange = this.accessArrayIndex(node.identifier, indexAccessions, node.line, env) 
            }else{
                let variable = env.getVar(node.identifier)
                if(!variable){ runtimeError(node.line, `Undefined variable ${node.identifier}`) }
                elemToChange = variable
            }

            let [elemToChangeType, elemToChangeVal] = elemToChange
            if(elemToChangeType != TYPES.TYPE_ARRAY){
                runtimeError(node.line, `Cannot access index on element of type ${elemToChangeType}`)
            }

            let [idxType, idxValue] = this.interpret(lastIndexAccession, env)
            if(idxType != TYPES.TYPE_NUMBER){
                runtimeError(node.line, `Expected type number for index, got ${idxType}`)
            }
            if(idxValue % 1 != 0){
                runtimeError(node.line, `Expected integer for index, got float`)
            }
            if(idxValue >= elemToChangeVal.length || idxValue < 0){
                runtimeError(node.line, `Index out of range`)
            }

            elemToChangeVal[idxValue] = this.interpret(node.value, env)
        }
        else if(node instanceof ASTNode.IfStmt){
            let [type, val] = this.interpret(node.conditionExpr, env)
            if(type != TYPES.TYPE_BOOL){
                runtimeError(node.line, `Expected type boolean for if condition, got ${type}`)
            }
            if(val){
                this.interpret(node.ifStatements, env)
            }else{
                this.interpret(node.elseStatements, env)
            }
        }
        else if(node instanceof ASTNode.WhileStmt){
            while(true){
                let [type, val] = this.interpret(node.conditionExpr, env)

                if(type != TYPES.TYPE_BOOL){
                    runtimeError(node.line, `Expected type boolean for the loop condition, got ${type}`)
                }

                if(!val){
                    break
                }

                this.interpret(node.statements, env)
            }
        }
        else if(node instanceof ASTNode.FunctionDeclarationStmt){
            env.setFunc(node.identifier.lexeme, node)
        }
        else if(node instanceof ASTNode.Stmts){
            for(let i = 0; i < node.stmts.length; i++){  
                this.interpret(node.stmts[i], env)
            }
        }
    }

    // global functions
    interpretPrintFunction(node, env){
        if(node.args.length != 1){
            runtimeError(node.line, `function print expects 1 argument, got ${node.args.length}`);
        }

        let result = this.interpret(node.args[0], env)
        formattedDatatype(result)
        console.log()
        
        return [TYPES.TYPE_NULL, null]
    }

    interpretArrPushFunction(node, env){
        if(node.args.length < 2){
            runtimeError(node.line, `function arr_push expects at least 2 arguments, got ${node.args.length}`);
        }
        if(node.args.length > 3){
            runtimeError(node.line, `function arr_push expects no more than 3 arguments, got ${node.args.length}`);
        }

        let arrayToPushInto = this.interpret(node.args[0], env)
        let [type, arr] = arrayToPushInto
        if(type != TYPES.TYPE_ARRAY){
            runtimeError(node.line, `function arr_push expects an array as it's first argument, got ${type}`);
        }

        let indexToPush = arr.length
        if(node.args.length == 3){
            let [idxType, idxVal] = this.interpret(node.args[2], env)
            if(idxType != TYPES.TYPE_NUMBER){
                runtimeError(node.line, `Expected type number as an index argument, got ${type}`)
            }
            if(idxVal % 1 != 0){
                runtimeError(node.line, `Expected integer as an index argument, got float`)
            }
            if(idxVal > arr.length || idxVal < 0){
                runtimeError(node.line, `Index out of range`)
            }
            indexToPush = idxVal
        }

        arr.splice(indexToPush, 0, this.interpret(node.args[1], env))
        return [TYPES.TYPE_NULL, null]
    }

    interpretArrPopFunction(node, env){
        if(node.args.length < 1){
            runtimeError(node.line, `function arr_pop expects at least 1 argument, got ${node.args.length}`);
        }
        if(node.args.length > 2){
            runtimeError(node.line, `function arr_pop expects no more than 2 arguments, got ${node.args.length}`);
        }

        let arrayToPopFrom = this.interpret(node.args[0], env)
        let [type, arr] = arrayToPopFrom
        if(type != TYPES.TYPE_ARRAY){
            runtimeError(node.line, `function arr_pop expects an array as it's first argument, got ${type}`);
        }        
        if(arr.length == 0){
            runtimeError(node.line, `Can't use arr_pop on empty array`);
        }

        let idxToRemove = arr.length - 1
        if(node.args.length == 2){
            let [idxType, idxVal] = this.interpret(node.args[1], env)
            if(idxType != TYPES.TYPE_NUMBER){
                runtimeError(node.line, `Expected type number as an index argument, got ${type}`)
            }
            if(idxVal % 1 != 0){
                runtimeError(node.line, `Expected integer as an index argument, got float`)
            }
            if(idxVal >= arr.length || idxVal < 0){
                runtimeError(node.line, `Index out of range`)
            }
            idxToRemove = idxVal
        }

        return arr.splice(idxToRemove, 1)[0]
    }

    interpretArrLengthFunction(node, env){
        if(node.args.length != 1){
            runtimeError(node.line, `function arr_length expects 1 argument, got ${node.args.length}`);
        }

        let array = this.interpret(node.args[0], env)
        let [type, arr] = array
        if(type != TYPES.TYPE_ARRAY){
            runtimeError(node.line, `function arr_length expects an array as it's first argument, got ${type}`);
        }
        
        return [TYPES.TYPE_NUMBER, arr.length]
    }

    InterpretGlobalFunction(node, env){
        if(node.identifier == 'print'){
            return this.interpretPrintFunction(node, env)
        }
        if(node.identifier == 'arr_push'){
            return this.interpretArrPushFunction(node, env)
        }
        if(node.identifier == 'arr_pop'){
            return this.interpretArrPopFunction(node, env)
        }
        if(node.identifier == 'arr_length'){
            return this.interpretArrLengthFunction(node, env)
        }
    }

    // helpers
    checkNumberOperands(leftType, rightType, operatorToken){
        if(leftType == TYPES.TYPE_NUMBER && rightType == TYPES.TYPE_NUMBER){return}
        runtimeError(operatorToken.line, `Operands of ${operatorToken.lexeme} must be two numbers`)
    }

    checkNumberAndStringOperands(leftType, rightType, operatorToken){
        if(leftType == TYPES.TYPE_NUMBER && rightType == TYPES.TYPE_NUMBER){return}
        if(leftType == TYPES.TYPE_STRING && rightType == TYPES.TYPE_STRING){return}
        runtimeError(operatorToken.line, `Operands of ${operatorToken.lexeme} must be two strings or two numbers`)
    }

    accessArrayIndex(variableName, indexAccessions, line, env){
        let variable = env.getVar(variableName)
        if(!variable){
            runtimeError(line, `Undefined variable ${variableName}`)
        }

        let varType = variable[0]
        if(varType != TYPES.TYPE_ARRAY){
            runtimeError(line, `Expected type array for ${variableName}, got ${varType}`)
        }

        let indexesToAccess = [];
        for(let i = 0; i < indexAccessions.length; i++){
            let [type, value] = this.interpret(indexAccessions[i], env)
            if(type != TYPES.TYPE_NUMBER){
                runtimeError(line, `Expected type number for index, got ${type}`)
            }
            if(value % 1 != 0){
                runtimeError(line, `Expected integer for index, got float`)
            }
            indexesToAccess.push(value)
        }

        let elemToAccess = variable[1]
        let elemToAccessType = TYPES.TYPE_ARRAY
        
        for(let i = 0; i < indexesToAccess.length; i++){
            let idx = indexesToAccess[i]

            if(elemToAccessType != TYPES.TYPE_ARRAY){
                runtimeError(line, `Cannot access index on element of type ${elemToAccessType}`)
            }

            if(idx >= elemToAccess.length || idx < 0){
                runtimeError(line, `Index out of range`)
            }

            [elemToAccessType, elemToAccess] = elemToAccess[idx]
        }

        return [elemToAccessType, elemToAccess]
    }

}
