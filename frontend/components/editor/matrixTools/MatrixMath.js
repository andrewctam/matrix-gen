import React, { useCallback, useState  } from 'react';
import Toggle from '../../navigation/Toggle';
import styles from "./MatrixMath.module.css"
import useExpand from './useExpand';

import { generateUniqueName, cloneMatrix, gaussian, LUDecomposition, inverse} from '../../matrixFunctions';
import BasicActionButton from './BasicActionButton';
import OverwriteInput from './OverwriteInput';
const MatrixMath = (props) => {
    const [expression, setExpression] = useState("");
    const [resultName, setResultName] = useState("");

    const [overwrite, setOverwrite] = useState(true);
    const [reductionName, setReductionName] = useState("");

    const matrixMath = useExpand(props.optionsBarRef);

    const toStringUpdateMatrix = (name, matrix) => {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                matrix[i][j] = matrix[i][j] + "";
            }
        }
        props.updateMatrix(name, matrix);
    }
        

    const updateParameter = (parameterName, updated) => {
        switch(parameterName) {
            case "Overwrite Current Matrix":
                setOverwrite(updated);
                setReductionName("");
                break;
            case "expression":
                if (/^[a-zA-Z0-9._*^+\-\s()]*$/.test(updated)) {
                    setExpression(updated);
                }
                return;
            case "resultName":
                if (/^[a-zA-Z0-9._\s]*$/.test(updated)) {
                    setResultName(updated);
                }
                return;
            case "reductionName":
                if (/^[a-zA-Z0-9._\s]*$/.test(updated)) {
                    setReductionName(updated);
                }
                return;
             
            default: return;
        }
    }

    const calculate = (e) => {
        e.preventDefault();

        if (expression === "") {
            alert("Please enter an expression using matrix names and these operators: + - * ^");
            return;
        }

        try {
            const postfix = infixToPostfix(expression);
            console.log(postfix)
            const matrix = evaluatePostfix(postfix);
            if (matrix !== null)
                toStringUpdateMatrix(resultName === "" ? undefined : resultName, matrix)
        } catch (error) {
            alert("Error in expression.");
            console.log(error);
        }

    }

    const infixToPostfix = (str) => {
        const output = [];
        const stack = [];

        var start = -1;
        var end = -1;
        var parsingLetter = false;
        var parsingNum = false;
        var subtractionSeen = false;
        var lastWasOperator = false;
        //ABC123

        for (let i = 0; i < str.length; i++) {
            var char = str.charAt(i);            
            if (char === " ") {
                continue;
            } else if (/[0-9.]/.test(char)) {
                if (parsingLetter) { //found number, but currently parsing a name
                    let finalName = str.substring(start, end + 1)
                    if (subtractionSeen) {
                        finalName = "-" + finalName;
                        subtractionSeen = false;
                    }

                    output.push(finalName);//push matrix name

                    start = -1 //reset start to indicate new parsing
                    parsingLetter = false;
                    stack.push("*") //push multiplication operator
                }
                parsingNum = true;
                lastWasOperator = false;
                    
                if (start === -1) { //start of number
                    start = i
                    end = i
                } else {
                    end++;
                }
            } else {
                if (/[A-Za-z_]/.test(char)) {
                    if (parsingNum) { //found name, but currently parsing a number
                        let finalNum = str.substring(start, end + 1)
                        if (subtractionSeen) {
                            finalNum = "-" + finalNum;
                            subtractionSeen = false;
                        }
                        output.push(finalNum) //push number
                        start = -1 //reset start to indicate new parsing
                        parsingNum = false;
                        stack.push("*") //push multiplication operator
                    }
                    parsingLetter = true;
                    lastWasOperator = false;

                    if (start === -1) { //start of name
                        start = i
                        end = i
                    }
                    else {
                        end++;
                    }
                } else {
                    if (start !== -1) {
                        let final = str.substring(start, end + 1); //final name or num
                        if (subtractionSeen) {
                            final = "-" + final;
                            subtractionSeen = false;
                        }
                        output.push(final)
                        start = -1;

                        if (parsingLetter)
                            parsingLetter = false
                        if (parsingNum) {
                            if (char === "(") {
                                stack.push("*") // 2(A + B) -> 2 * (A + B)
                            }
                            parsingNum = false
                        }
                    }

                    if (char === "(") {
                        stack.push(char)
                    } else if (char === ")") {
                        while (stack[stack.length - 1] !== "(")
                            output.push(stack.pop())
                        stack.pop();
                    } else {
                        if (char === "-") {
                            if (subtractionSeen) {
                                subtractionSeen = false; //double negative
                                continue;
                            } else if (lastWasOperator || (output.length === 0 && stack.length === 0)) { //treat as invert (A + -B)
                                subtractionSeen = true;
                                continue
                            } else {
                                subtractionSeen = true
                                char = "+"; //subtraction is addding a negative value
                            }
                        } else {
                            subtractionSeen = false;
                        }

                        lastWasOperator = true;
                        if (stack.length === 0 || stack[stack.length - 1] === "(")
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
        }

        if (start !== -1) {
            let final = str.substring(start, end + 1); //final name or num
            if (subtractionSeen) {
                final = "-" + final;
                subtractionSeen = false;
            }
            output.push(final)
        }

        while (stack.length > 0)
            output.push(stack.pop())

        return output

    }

    const orderOfOperations = (operator) => {
        if (operator === "+")
            return 0
        if (operator === "*" || operator === "^")
            return 1
    }

    const matrixPower = (a, pow) => {
        if (typeof (pow) !== "number") {
            if (typeof (a) !== "object")
                return null; //num to matrix 2 ^ A is invalid
        } else if (typeof (a) === "number") {
            return Math.pow(a, pow); //num to num 2 ^ 2
        }

        //matrix to num A ^ 2

        //deep copy matrix
        var product = cloneMatrix(a);

        for (let i = 1; i < pow; i++)
            product = matrixMultiplication(product, a);
        return product
    }

    const matrixMultiplication = (a, b) => {
        if (typeof (a) === "number" && typeof (b) === "number") {
            return a * b; //scalar multiplication
        }
        else if (typeof (a) === "object" && typeof (b) === "number") {
            var product = cloneMatrix(a); //deep copy matrix

            for (let i = 0; i < a.length - 1; i++)
                for (let j = 0; j < a[0].length - 1; j++)
                    product[i][j] *= b; //matrix scalar multiplication

            return product
        } else if (typeof (a) === "number" && typeof (b) === "object") {
            product = cloneMatrix(b); //deep copy matrix
            for (let i = 0; i < b.length - 1; i++)
                for (let j = 0; j < b[0].length - 1; j++)
                    product[i][j] *= a; //matrix scalar multiplication

            return product
        }

        //matrix multiplication
        if (a.length !== b[0].length)
            return null;

        product = new Array(a.length).fill(null).map(() => new Array(b[0].length).fill(""));

        //n^3 matrix multiplication
        for (let i = 0; i < a.length - 1; i++) {
            for (let j = 0; j < b[0].length - 1; j++) {
                let sum = 0
                for (let k = 0; k < b.length - 1; k++) {
                    sum += a[i][k] * b[k][j]
                }
                product[i][j] = sum
            }
        }

        return product
    }

    const matrixAddition = (a, b) => {
        if (a.length !== b.length || a[0].length !== b[0].length) { //check dimensions
            return null;
        }

        const matrixSum = new Array(a.length).fill(null).map(() => new Array(a[0].length).fill(""));

        for (let i = 0; i < a.length - 1; i++) {
            for (let j = 0; j < b[0].length - 1; j++) {
                matrixSum[i][j] = a[i][j] + b[i][j]
            }
        }

        return matrixSum;
    }


    const evaluatePostfix = (postFix) => {
        const stack = []
        for (let i = 0; i < postFix.length; i++) {
            switch (postFix[i]) {
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

                default:
                    if (/^[-]?([0-9]*[.])?[0-9]+$/.test(postFix[i]))
                        stack.push(parseFloat(postFix[i]));
                    else {
                        let negative = false;
                        if (postFix[i].charAt(0) === "-") {
                            var matrix = cloneMatrix(props.matrices[postFix[i].substring(1)])
                            negative = true;
                        } else
                            matrix = props.matrices[postFix[i]]

                        if (!matrix in props.matrices) {
                            alert(matrix + " does not exist")
                            return null;
                        }

                        let parsedMatrix = cloneAndVerify(matrix); //replace sparseVals and parse floats
                        if (parsedMatrix === null) {
                            alert("Error in input. Matrix " + postFix[i] + " is not a valid matrix or contains non-numeric values")
                            return null;
                        } else {
                            if (negative)
                                parsedMatrix = matrixMultiplication(parsedMatrix, -1)

                            stack.push(parsedMatrix)
                        }
                    }
                    break;
                }
            
        }
        


        if (typeof (stack[0]) === "number")
            return null;

        return stack[0]
    }
    

    const cloneAndVerify = (matrix) => {
        const clone = cloneMatrix(matrix)

        for (let i = 0; i < clone.length - 1; i++) {
            for (let j = 0; j < clone[0].length - 1; j++) {
                if (clone[i][j] === "")
                    clone[i][j] = props.sparseVal
    
                if (/^[-]?([0-9]*[.])?[0-9]+$/.test(clone[i][j])) {
                    clone[i][j] = parseFloat(clone[i][j])
    
                    if (isNaN(clone[i][j])) {
                        return null;
                    }
                } else {
                    return null;
                }
            }
    
    
        }

        return clone;
    }




    const numMatrix = cloneAndVerify(props.matrix);
    if (numMatrix) {
        var [L, U, sign] = LUDecomposition(numMatrix)
        if (L === null || U === null) {
            determinant = 0;
        } else {
            var determinant = sign;
            for (let i = 0; i < U.length - 1; i++) {
                determinant *= U[i][i]
            }
        }
    }

    const placeholderName = generateUniqueName(props.matrices);
    const isSquare = props.matrix.length === props.matrix[0].length

    if (overwrite)
        var newName = props.name;
    else if (reductionName === "")
        newName = placeholderName;
    else
        newName = reductionName

    return <div ref={matrixMath} className={"fixed-bottom " + styles.matrixMathContainer}>
       
        <div className="row">
            <form onSubmit={calculate} className="col-sm-6">
                <h2 className = {styles.title}>Matrix Calculator</h2>

                <div className={styles.inputBlock}>
                    Expression:
                    <input type="text" className={styles.mathInput} value={expression} placeholder={"e.g. (A + B) * 2C"}
                        onChange={(e) => {
                            updateParameter("expression", e.target.value)
                    }} />
                </div>
                <div className={styles.arrow}>→</div>
                <div className={styles.inputBlock}>
                    Save as:
                    <input type="text" className={styles.nameInput} value={resultName} placeholder={placeholderName} 
                     onChange={(e) => {
                        updateParameter("resultName", e.target.value)
                    }} />
                
                </div>

                <button className={"btn btn-success " + styles.mathEvalButton} onClick={calculate}>Evaluate Expression</button>
            </form>

            {numMatrix === null ?
            <div className = "col-sm-6"> 
                Matrix contains non-numerical values
            </div>
            :
            <div className='col-sm-6'>
                <h2 className = {styles.title}>Matrix Reductions</h2>

                <OverwriteInput
                    overwrite = {overwrite}
                    updateParameter = {updateParameter}
                    id = "reductionName"
                    placeholder = {placeholderName}
                    newName = {reductionName}
                />  
        

                <ul>
                    <BasicActionButton name = "RREF" action = {() => {
                        toStringUpdateMatrix(newName, gaussian(numMatrix))
                    }}/>
                    
                    {isSquare && determinant !== 0 ?
                    <>
                        <BasicActionButton name = "L" action = {() => {
                            toStringUpdateMatrix(newName, L)
                        }}/>
                        <BasicActionButton name = "U" action = {() => {
                            toStringUpdateMatrix(newName, U);
                        }}/>

                        <BasicActionButton name = "Inverse" action = {() => {
                            toStringUpdateMatrix(newName, inverse(numMatrix))
                        }}/>
                    </>
                    : null}

                </ul>
            
                <div className = {styles.detInfo}>
                    {isSquare ?
                    `Determinant: ${determinant}` 
                    :
                    "Matrix is not square."
                    }
                </div>


            </div>
            }

        </div>
        <Toggle toggle={props.close} show={!props.active} />
    </div>



}







export default MatrixMath;
