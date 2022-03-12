import React from 'react';

class MatrixMath extends React.Component {    
    constructor(props) {
        super(props);
        this.state = {
            expression: ""
        };
    }

    render() { 
        
        return <div>
            <input type="text" value = {this.state.expression} placeholder = {"(A + B) * C"} onChange = {this.handleChange}></input><br />
            <button class = "btn btn-secondary" onClick={this.calculate}>Calculate</button>
        </div>
    }

    handleChange = (e) => {
        var updated = e.target.value
        if (/^[a-zA-Z0-9*+\-\s()]*$/.test(updated)) {
            this.setState({expression: updated})
        }   
    }

    calculate = (e) => {
        var postfix = this.shuntingYard(this.state.expression);
        console.log(postfix)
        this.props.addMatrix(this.evaluatePostfix(postfix));
    }

    shuntingYard = (str) => {
        var output = [];
        var stack = [];
        
        var start = -1;
        var end = -1;
        var char;

        for (var i = 0; i < str.length; i++) {
            char = str.charAt(i);

            if (char === " ") {
                if (i === str.length - 1)
                    output.push(str.substring(start, end + 1))
                else
                    continue;
            } else if (/[A-Za-z-0-9]/.test(char)) {
                if (start === -1) {
                    start = i
                    end = i
                }
                else
                    end++;
                
                if (i === str.length - 1) {
                    output.push(str.substring(start, end + 1))
                }
            } else { 
                if (start !== -1) {
                    output.push(str.substring(start, end + 1))
                    start = -1;
                    end = -1;
                }
            
                if (char === "(")
                    stack.push(char)
                else if (char === ")") {
                    while (stack[stack.length - 1] !== "(")
                        output.push(stack.pop())
                    stack.pop();
                }
                else if (stack.length === 0 || stack[stack.length - 1] === "(")
                    stack.push(char)
                else if (this.orderOfOperations(char) > this.orderOfOperations(stack[stack.length - 1]))
                    stack.push(char)
                else {
                    while (stack.length > 0 && this.orderOfOperations(char) <= this.orderOfOperations(stack[stack.length - 1]))
                        output.push(stack.pop())
                    stack.push(char)
                }
            }

                
        }

        while (stack.length > 0)
            output.push(stack.pop())
        return output

    }

    orderOfOperations = (operator) => {
        if (operator === "+" || operator === "-")
            return 0
        if (operator === "*")
            return 1
    }

    matrixMultiplication = (a, b) => {
        var product = []
        for (var i = 0; i < a.length - 1; i++) {
            var row = []
            for (var j = 0; j < b[0].length - 1; j++)  {
                var sum = 0
                for (var k = 0; k < b.length - 1; k++) {
                    if (a[i][k] === "")
                        var aVal = parseInt(this.props.sparseVal)
                    else
                        aVal = parseInt(a[i][k])
                         
                         
                    if (b[k][j] === "")
                        var bVal = parseInt(this.props.sparseVal)
                    else
                        bVal = parseInt(b[k][j])

                    sum += aVal * bVal
                }
                row.push(sum)
            }
            row.push("")
            product.push(row)  
        }
    
        product.push(Array(b[0].length).fill(""))
        return product
    }        
    
    matrixAddition = (a, b) => {
        var matrixSum = []
        var aVal, bVal;
        for (var i = 0; i < a.length - 1; i++) {
            var row = []
            for (var j = 0; j < b[0].length - 1; j++)  {
                if (a[i][j] === "")
                    aVal = parseInt(this.props.sparseVal)
                else
                    aVal = parseInt(a[i][j])
                         
                if (b[i][j] === "")
                    bVal = parseInt(this.props.sparseVal)
                else
                    bVal = parseInt(b[i][j])

                row.push(aVal + bVal)
                
            }
            row.push("")
            matrixSum.push(row)
        }
        matrixSum.push(Array(a.length).fill(""))
        return matrixSum
    }  

    matrixSubtraction = (a, b) => {
        var matrixDiff = []
        var aVal, bVal;
        for (var i = 0; i < a.length - 1; i++) {
            var row = []
            for (var j = 0; j < b[0].length - 1; j++)  {
                if (a[i][j] === "")
                    aVal = parseInt(this.props.sparseVal)
                else
                    aVal = parseInt(a[i][j])
                          
                if (b[i][j] === "")
                    bVal = parseInt(this.props.sparseVal)
                else
                    bVal = parseInt(b[i][j])

            row.push(aVal - bVal)
            }

            row.push("")
            matrixDiff.push(row)
        }

        matrixDiff.push(Array(a.length).fill(""))

        return matrixDiff
    }  


    evaluatePostfix = (postFix) => {
        var stack = []
        var a, b;
            for (var i = 0; i < postFix.length; i++) {
                switch(postFix[i]) {
                    case "*":
                        b = stack.pop()
                        a = stack.pop()
                        stack.push(this.matrixMultiplication(a, b))
                        break;
                    case "+":
                        stack.push(this.matrixAddition(stack.pop(), stack.pop()))
                        break;
                    case "-":
                        stack.push(this.matrixSubtraction(stack.pop(), stack.pop()))
                        break;
                    default:
                        if (postFix[i] in this.props.matrices) {
                            stack.push(this.props.matrices[postFix[i]]);
                            break;
                        } else {
                            alert(postFix[i] + " does not exist")
                            return;
                        }

                }
            

        }

        return stack[0]

    }



}







export default MatrixMath;
