import * as ASTNode from './ASTNodes.js'
import * as TOKENS from  './tokens.js'
import { runtimeError } from  './utils.js'


const TYPE_NUMBER = 'TYPE_NUMBER'
const TYPE_STRING = 'TYPE_STRING'  
const TYPE_BOOL   = 'TYPE_BOOL'
const TYPE_NULL   = 'TYPE_NULL'

export default class Interpreter{
    interpretAst(ast){
        return this.interpret(ast)
    }

    interpret(node){
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
        else if(node instanceof ASTNode.Grouping){
            return this.interpret(node.value)
        }
        else if(node instanceof ASTNode.Unary){
            let [type, val] = this.interpret(node.right)

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
            let [leftType, leftVal] = this.interpret(node.left)
            let [rightType, rightVal] = this.interpret(node.right)
        
            if(node.op.type == TOKENS.PLUS){
                this.checkNumberAndStringOperands(leftType, rightType, node.op)
                return [TYPE_NUMBER, leftVal + rightVal]
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
    }


    // helpers
    checkNumberOperands(leftType, rightType, operatorToken){
        if(leftType == TYPE_NUMBER && rightType == TYPE_NUMBER){return}
        runtimeError(`Operands of ${operatorToken.lexeme} must be two numbers`, operatorToken.line)
    }

    checkNumberAndStringOperands(leftType, rightType, operatorToken){
        if(leftType == TYPE_NUMBER && rightType == TYPE_NUMBER){return}
        if(leftType == TYPE_STRING && rightType == TYPE_STRING){return}
        runtimeError(`Operands of ${operatorToken.lexeme} must be two strings or two numbers`, operatorToken.line)
    }

}