import * as ASTNode from './ASTNodes.js'
import * as TOKENS from  './tokens.js'
import { runtimeError, formattedDatatype } from  './utils.js'
import Environment from  './environment.js'

const TYPE_ARRAY = 'TYPE_ARRAY'
const TYPE_NUMBER = 'TYPE_NUMBER'
const TYPE_STRING = 'TYPE_STRING'  
const TYPE_BOOL   = 'TYPE_BOOL'
const TYPE_NULL   = 'TYPE_NULL'

export default class Interpreter{
    interpretAst(statements){
        return this.interpret(statements, new Environment())
    }

    interpret(node, env){
        // expressions
        if(node instanceof ASTNode.Number){
            return [TYPE_NUMBER, parseFloat(node.value)]
        }
        else if(node instanceof ASTNode.String){
            return [TYPE_STRING, node.value]
        }
        else if(node instanceof ASTNode.Bool){
            return [TYPE_BOOL, node.value]
        }
        else if(node instanceof ASTNode.Null){
            return [TYPE_NULL, node.value]
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
            return [TYPE_ARRAY, arr]
        }
        else if(node instanceof ASTNode.ArrayAccession){
            let variableName = node.identifier
            let variable = env.getVar(variableName)
            if(!variable){
                runtimeError(node.line, `Undefined variable ${variableName}`)
            }

            let varType = variable[0]
            if(varType != TYPE_ARRAY){
                runtimeError(node.line, `Expected type array for ${variableName}, got ${varType}`)
            }

            let indexAccessions = node.values
            let indexesToAccess = [];
            for(let i = 0; i < indexAccessions.length; i++){
                let [type, value] = this.interpret(indexAccessions[i], env)
                if(type != TYPE_NUMBER){
                    runtimeError(node.line, `Expected type number for index, got ${type}`)
                }
                indexesToAccess.push(value)
            }

            let elemToAccess = variable[1]
            let elemToAccessType = TYPE_ARRAY
            
            for(let i = 0; i < indexesToAccess.length; i++){
                let idx = indexesToAccess[i]

                if(elemToAccessType != TYPE_ARRAY){
                    runtimeError(node.line, `Cannot access index on element of type ${elemToAccessType}`)
                }

                if(idx >= elemToAccess.length || idx < 0){
                    runtimeError(node.line, `Index out of range`)
                }

                [elemToAccessType, elemToAccess] = elemToAccess[idx]
            }

            return [elemToAccessType, elemToAccess]
        }
        else if(node instanceof ASTNode.Grouping){
            return this.interpret(node.value, env)
        }
        else if(node instanceof ASTNode.Unary){
            let [type, val] = this.interpret(node.right, env)

            if(node.op.type == TOKENS.MINUS){
                if(type == TYPE_NUMBER){
                    return [TYPE_NUMBER, -1 * val]
                }else{
                    runtimeError(node.op.line, `An operand of ${node.op.lexeme} must be a number`)
                }
            }

            if(node.op.type == TOKENS.BANG){
                if(type == TYPE_BOOL){
                    return [TYPE_BOOL, !val]
                }else{
                    runtimeError(node.op.line, `An operand of ${node.op.lexeme} must be a boolean`)
                }
            }
        }else if(node instanceof ASTNode.Binary){
            let [leftType, leftVal] = this.interpret(node.left, env)
            let [rightType, rightVal] = this.interpret(node.right, env)
        
            if(node.op.type == TOKENS.PLUS){
                this.checkNumberAndStringOperands(leftType, rightType, node.op)
                return [leftType, leftVal + rightVal]
            } 
            else if(node.op.type == TOKENS.MINUS){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPE_NUMBER, leftVal - rightVal]
            }   
            else if(node.op.type == TOKENS.SLASH){
                if(rightVal == 0){
                    runtimeError(`Division by zero`, node.op.line)
                }
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPE_NUMBER ,leftVal / rightVal]
                
            }
            else if(node.op.type == TOKENS.STAR){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPE_NUMBER, leftVal * rightVal]
            }
            else if(node.op.type == TOKENS.GREATER){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPE_BOOL, leftVal > rightVal]
            }
            else if(node.op.type == TOKENS.GREATER_EQUAL){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPE_BOOL, leftVal >= rightVal]
            }
            else if(node.op.type == TOKENS.LESS){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPE_BOOL, leftVal < rightVal]
            }
            else if(node.op.type == TOKENS.LESS_EQUAL){
                this.checkNumberOperands(leftType, rightType, node.op)
                return [TYPE_BOOL, leftVal <= rightVal]
            }
            else if(node.op.type == TOKENS.BANG_EQUAL){
                return [TYPE_BOOL, leftVal != rightVal]
            }
            else if(node.op.type == TOKENS.EQUAL_EQUAL){
                return [TYPE_BOOL, leftVal === rightVal]
            }
        }

        // statements
        else if(node instanceof ASTNode.ExpressionStmt){
            this.interpret(node.expression, env)
        }
        else if(node instanceof ASTNode.PrintStmt){
            let result = this.interpret(node.expression, env)
            formattedDatatype(result)
            console.log()
        }
        else if(node instanceof ASTNode.StandardAssignmentStmt){
            let value = this.interpret(node.value, env)
            env.setVar(node.identifier, value)
        }
        else if(node instanceof ASTNode.ArrayElementAssignmentStmt){
            let variableName = node.identifier
            let variable = env.getVar(variableName) 
            if(!variable){
                runtimeError(node.line, `Undefined variable ${variableName}`)
            }

            let varType = variable[0]
            if(varType != TYPE_ARRAY){
                runtimeError(node.line, `Expected type array for ${variableName}, got ${varType}`)
            }

            let indexAccessions = node.indexExpressions
            let indexesToAccess = [];
            for(let i = 0; i < indexAccessions.length; i++){
                let [type, value] = this.interpret(indexAccessions[i], env)
                if(type != TYPE_NUMBER){
                    runtimeError(node.line, `Expected type number for index, got ${type}`)
                }
                indexesToAccess.push(value)
            }

            let elemToAccess = variable[1]
            let elemToAccessType = TYPE_ARRAY
            let arrayToChange = elemToAccess
            let idx = indexesToAccess[0]
            
            for(let i = 0; i < indexesToAccess.length; i++){
                idx = indexesToAccess[i]

                if(elemToAccessType != TYPE_ARRAY){
                    runtimeError(node.line, `Cannot access index on element of type ${elemToAccessType}`)
                }
                arrayToChange = elemToAccess

                if(idx >= elemToAccess.length || idx < 0){
                    runtimeError(node.line, `Index out of range`)
                }

                [elemToAccessType, elemToAccess] = elemToAccess[idx]
            }

            arrayToChange[idx] = this.interpret(node.value)
        }
        else if(node instanceof ASTNode.Stmts){
            for(let i = 0; i < node.stmts.length; i++){
                this.interpret(node.stmts[i], env)
            }
        }
    }

    // helpers
    checkNumberOperands(leftType, rightType, operatorToken){
        if(leftType == TYPE_NUMBER && rightType == TYPE_NUMBER){return}
        runtimeError(operatorToken.line, `Operands of ${operatorToken.lexeme} must be two numbers`)
    }

    checkNumberAndStringOperands(leftType, rightType, operatorToken){
        if(leftType == TYPE_NUMBER && rightType == TYPE_NUMBER){return}
        if(leftType == TYPE_STRING && rightType == TYPE_STRING){return}
        runtimeError(operatorToken.line, `Operands of ${operatorToken.lexeme} must be two strings or two numbers`)
    }

}


