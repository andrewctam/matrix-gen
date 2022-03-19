import React from 'react';

class MatrixMath extends React.Component {    
    constructor(props) {
        super(props);
        this.state = {
            expression: ""
        };
    }

    render() { 
        
        return <div className = "row matrixMath">
            <div className = "col-sm-3">
                <input type="text" className = "mathInput" value = {this.state.expression} placeholder = {"(A + B) * C"} onChange = {this.handleChange}></input>
                <br/>
                <button class = "btn btn-secondary mathEval" onClick={this.calculate}>Evaluate Expression</button>
            </div>

            <div className = "col-sm-9">
                <ul>
                    <li>Enter a math expression. The resulting matrix will be added as a new matrix</li>
                    <li>You can enter matrix names or numbers (for matrix scalar multiplication). Valid operators: * ^ + -</li>
                    <li>You can use parentheses to specify order of operations. However, use * for multiplication</li>
                </ul>
            </div>


        </div>
    }

    handleChange = (e) => {
        var updated = e.target.value
        if (/^[a-zA-Z0-9._*^+\-\s()]*$/.test(updated)) {
            this.setState({expression: updated})
        }   
    }

    calculate = (e) => {
        var postfix = this.shuntingYard(this.state.expression);
        console.log(postfix)
        var matrix = this.evaluatePostfix(postfix);

        if (matrix !== null)
            this.props.addMatrix(matrix)
        

    }

    shuntingYard = (str) => {
        var output = [];
        var stack = [];
        
        var start = -1;
        var end = -1;
        var char;
        var parsingLetter = false;
        var parsingNum = false;
        //ABC123

        for (var i = 0; i < str.length; i++) {
            char = str.charAt(i);
        
            if (char === " ") {
                if (i === str.length - 1)
                    output.push(str.substring(start, end + 1))
                else
                    continue;
            } else if (/[0-9.]/.test(char))  {
                if (parsingLetter) {
                    output.push(str.substring(start, end + 1))
                    start = -1
                    parsingLetter = false;
                    stack.push("*")
                } 
                parsingNum = true;

                if (start === -1) {
                    start = i
                    end = i
                } else {
                    end++;
                }
                    
                if (i === str.length - 1) {
                    output.push(str.substring(start, end + 1))
                }
            } else {
                if (/[A-Za-z_]/.test(char)) {
                    if (parsingNum) {
                        output.push(str.substring(start, end + 1))
                        start = -1
                        parsingNum = false;
                        stack.push("*")
                    } 
                    parsingLetter = true;
                    
                    if (start === -1) {
                        start = i
                        end = i
                    }
                    else {
                        end++;
                    }
                        
                    if (i === str.length - 1) {
                        output.push(str.substring(start, end + 1))
                    }
                } else { 
                    if (start !== -1) {
                        output.push(str.substring(start, end + 1))
                        start = -1;
                        if (parsingLetter)
                            parsingLetter = false
                        if (parsingNum)
                            parsingNum = false
                    }
                
                    if (char === "(") {

                        stack.push(char)
                    }
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

                
        }

        while (stack.length > 0)
            output.push(stack.pop())

        return output

    }

    orderOfOperations = (operator) => {
        if (operator === "+" || operator === "-")
            return 0
        if (operator === "*" || operator === "^")
            return 1
    }
    
    matrixPower = (a, pow) => {
        if (typeof(pow) !== "number") {
            if (typeof(a) !== "object")
                return null;
        } else if (typeof(a) === "number") {
            return Math.pow(a, pow);
        }
 
        var product = JSON.parse(JSON.stringify(a));
        for (var i = 0; i < a.length; i++)
            for (var j = 0; j < a.length; j++)
               product[i][j] = a[i][j];
        
        console.log(product)
        for (i = 1; i < pow; i++)
            product = this.matrixMultiplication(product, a);
        return product
    }

    matrixMultiplication = (a, b) => {
        if (typeof(a) === "number" && typeof(b) === "number") {
            return a * b; //scalar multiplication
        }
        else if (typeof(a) === "object" && typeof(b) === "number") {
            var product = JSON.parse(JSON.stringify(a));
            for (var i = 0; i < a.length - 1; i++)
                for (var j = 0; j < a[0].length - 1; j++)
                product[i][j] = b * a[i][j]; //matrix scalar multiplication

            return product
        } else if (typeof(a) === "number" && typeof(b) === "object") {
            product = JSON.parse(JSON.stringify(b));
            for (i = 0; i < b.length - 1; i++)
                for (j = 0; j < b[0].length - 1; j++)
                product[i][j] = a * b[i][j]; //matrix scalar multiplication

            return product
        }


        if (a.length !== b[0].length)
            return null;

        product = []
        for (i = 0; i < a.length - 1; i++) {
            var row = []
            for (j = 0; j < b[0].length - 1; j++)  {
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
        if (a.length !== b.length || a[0].length !== b[0].length) {
            return null;
        }

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
        if (a.length !== b.length || a[0].length !== b[0].length)
            return null;

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
        var a, b, result;
        for (var i = 0; i < postFix.length; i++) {
            switch(postFix[i]) {
                case "*":
                    b = stack.pop()
                    a = stack.pop()
                    result = this.matrixMultiplication(a, b)
                    if (result === null) {
                        alert("Error in input. Matrices have different rows and column dimensions")
                        return null
                    }

                    stack.push(result)
                    break;
                case "^":
                    b = stack.pop()
                    a = stack.pop()
                    result = this.matrixPower(a, b)
                    if (result === null) {
                        alert("Error in input. Matrices have different rows and column dimensions")
                        return null
                    }

                    stack.push(result)
                    break;
                case "+":
                    b = stack.pop()
                    a = stack.pop()
                    result = this.matrixAddition(b, a)
                    if (result === null) {
                        alert("Error in input. Matrices have different dimensions")
                        return null;
                    }

                    stack.push(result)
                    break;
                case "-":
                    b = stack.pop()
                    a = stack.pop()
                    result = this.matrixSubtraction(b, a)
                    if (result === null) {
                        alert("Error in input. Matrices have different dimensions")
                        return null;
                    }

                    stack.push(result)
                    break;
                default:
                    if (/^[0-9]*$/.test(postFix[i]))
                        stack.push(parseFloat(postFix[i]));
                    else if (postFix[i] in this.props.matrices) {
                        stack.push(this.props.matrices[postFix[i]]);
                        break;
                    } else {
                        alert(postFix[i] + " does not exist")
                        return null;;
                    }
            }
        }


        if (typeof(stack[0]) === "number")
            return null;    
            
        return stack[0]
    }



}







export default MatrixMath;
