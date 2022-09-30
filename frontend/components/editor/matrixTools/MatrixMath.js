import React, {useState, useEffect, useRef} from 'react';
import Toggle from '../../navigation/Toggle';
import styles from "./MatrixMath.module.css"
import useExpand from './useExpand';

import { generateUniqueName } from '../../matrixFunctions';

const MatrixMath = (props) => {     
    const [expression, setExpression] = useState("");
    const [resultName, setResultName] = useState("");

    const matrixMath = useExpand(props.optionsBarRef);

    const handleChange = (e) => {
        var updated = e.target.value
        if (/^[a-zA-Z0-9._*^+\-\s()]*$/.test(updated)) {
            setExpression(updated);
        }   
    }

    const handleResultNameChange = (e) => {
        var updated = e.target.value
        if (/^[a-zA-Z0-9._\s]*$/.test(updated)) {
            setResultName(updated);
        }
    }

    const calculate = (e) => {
        e.preventDefault();

        if (expression === "") {
            alert("Please enter an expression using matrix names and these operators: + - * ^");
            return;
        }
        
        
        const postfix = infixToPostfix("(A + B) * 2C");
        
        const matrix = evaluatePostfix(postfix);

        if (matrix !== null)
            props.setMatrix(resultName === "" ? undefined : resultName, matrix)

    }

    const infixToPostfix = (str) => {
        const output = [];
        const stack = [];
        
        var start = -1;
        var end = -1;
        var parsingLetter = false;
        var parsingNum = false;
        //ABC123

        for (let i = 0; i < str.length; i++) {
            var char = str.charAt(i);
        
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
                    else if (orderOfOperations(char) > orderOfOperations(stack[stack.length - 1]))
                        stack.push(char)
                    else {
                        while (stack.length > 0 && orderOfOperations(char) <= orderOfOperations(stack[stack.length - 1]))
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

    const orderOfOperations = (operator) => {
        if (operator === "+" || operator === "-")
            return 0
        if (operator === "*" || operator === "^")
            return 1
    }
    
    const matrixPower = (a, pow) => {
        if (typeof(pow) !== "number") {
            if (typeof(a) !== "object")
                return null; //num to matrix 2 ^ A is invalid
        } else if (typeof(a) === "number") {
            return Math.pow(a, pow); //num to num 2 ^ 2
        }
        
        //matrix to num A ^ 2
        
        //deep copy matrix
        var product = JSON.parse(JSON.stringify(a));
        
        for (let i = 1; i < pow; i++)
            product = matrixMultiplication(product, a);
        return product
    }

    const matrixMultiplication = (a, b) => {
        if (typeof(a) === "number" && typeof(b) === "number") {
            return a * b; //scalar multiplication
        }
        else if (typeof(a) === "object" && typeof(b) === "number") {
            var product = JSON.parse(JSON.stringify(a)); //deep copy matrix

            for (let i = 0; i < a.length - 1; i++)
                for (let j = 0; j < a[0].length - 1; j++)
                product[i][j] = b * a[i][j]; //matrix scalar multiplication

            return product
        } else if (typeof(a) === "number" && typeof(b) === "object") {
            product = JSON.parse(JSON.stringify(b)); //deep copy matrix
            for (let i = 0; i < b.length - 1; i++)
                for (let j = 0; j < b[0].length - 1; j++)
                product[i][j] = a * b[i][j]; //matrix scalar multiplication

            return product
        }

        //matrix multiplication
        if (a.length !== b[0].length)
            return null;

        product = [] //n^3 matrix multiplication
        for (let i = 0; i < a.length - 1; i++) {
            var row = []
            for (let j = 0; j < b[0].length - 1; j++)  {
                var sum = 0
                for (let k = 0; k < b.length - 1; k++) {
                    if (a[i][k] === "")
                        var aVal = parseInt(props.sparseVal)
                    else
                        aVal = parseInt(a[i][k])
                         
                         
                    if (b[k][j] === "")
                        var bVal = parseInt(props.sparseVal)
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
    
    const matrixAddition = (a, b) => {
        if (a.length !== b.length || a[0].length !== b[0].length) { //check dimensions
            return null;
        }

        const matrixSum = []
        
        for (let i = 0; i < a.length - 1; i++) {
            const row = []
            for (let j = 0; j < b[0].length - 1; j++)  {
                //if either value is empty, use sparse value
                if (a[i][j] === "")
                    var aVal = parseInt(props.sparseVal)
                else
                    aVal = parseInt(a[i][j])
                        
                if (b[i][j] === "")
                    var bVal = parseInt(props.sparseVal)
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

    const matrixSubtraction = (a, b) => { //same as addition but with subtraction operator
        if (a.length !== b.length || a[0].length !== b[0].length)
            return null;

        const matrixDiff = []
        for (let i = 0; i < a.length - 1; i++) {
            const row = []
            for (let j = 0; j < b[0].length - 1; j++)  {
                if (a[i][j] === "")
                    var aVal = parseInt(props.sparseVal)
                else
                    aVal = parseInt(a[i][j])
                          
                if (b[i][j] === "")
                    var bVal = parseInt(props.sparseVal)
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


    const evaluatePostfix = (postFix) => {
        const stack = []
        for (let i = 0; i < postFix.length; i++) {
            switch(postFix[i]) {
                case "*":
                    var b = stack.pop()
                    var a = stack.pop()
                    var result = matrixMultiplication(a, b)
                    if (result === null) {
                        alert("Error in input. Matrices have different rows and column dimensions")
                        return null
                    }

                    stack.push(result)
                    break;
                case "^":
                    b = stack.pop()
                    a = stack.pop()
                    result = matrixPower(a, b)
                    if (result === null) {
                        alert("Error in input. Matrices have different rows and column dimensions")
                        return null
                    }

                    stack.push(result)
                    break;
                case "+":
                    b = stack.pop()
                    a = stack.pop()
                    result = matrixAddition(b, a)
                    if (result === null) {
                        alert("Error in input. Matrices have different dimensions")
                        return null;
                    }

                    stack.push(result)
                    break;
                case "-":
                    b = stack.pop()
                    a = stack.pop()
                    result = matrixSubtraction(b, a)
                    if (result === null) {
                        alert("Error in input. Matrices have different dimensions")
                        return null;
                    }

                    stack.push(result)
                    break;
                default:
                    if (/^[0-9]*$/.test(postFix[i]))
                        stack.push(parseFloat(postFix[i]));
                    else if (postFix[i] in props.matrices) {
                        stack.push(props.matrices[postFix[i]]);
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

    const placeholderName = generateUniqueName(props.matrices);
    
    return <div ref = {matrixMath} className = {"fixed-bottom " + styles.matrixMathContainer}>

        <form onSubmit = {calculate}>
            <div className = {styles.inputBlock}>
                Expression:
                <input type="text" className = {styles.mathInput} value = {expression} placeholder = {"e.g. (A + B) * 2C"} onChange = {handleChange}></input>
            </div>

            <div className = {styles.inputBlock}>
                Save as:
                <input type="text" className = {styles.nameInput} value = {resultName} placeholder = {placeholderName} onChange = {handleResultNameChange}></input>
            </div>
            
            <button className = {"btn btn-success " + styles.mathEvalButton} onClick={calculate}>Evaluate Expression</button>
        </form>

     
        <Toggle toggle = {props.close} show = {!props.active}/>



    </div>
    


}







export default MatrixMath;
