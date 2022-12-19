import React, { useState, useMemo, useRef, ReactText  } from 'react';
import styles from "./MatrixMath.module.css"

import { generateUniqueName, cloneMatrix, gaussian, LUDecomposition, inverse, createIdentity} from '../../matrixFunctions';
import Toggle from '../../buttons/Toggle';
import BasicActionButton from '../../buttons/BasicActionButton';
import OverwriteInput from '../../inputs/OverwriteInput'
import useExpand from '../../../hooks/useExpand';
import { Matrices, Settings } from '../../App';

interface MatrixMathProps {
    matrices: Matrices
    matrix: string[][]
    name: string
    toStringUpdateMatrix: (name: string | undefined, matrix: number[][]) => void
    settings: Settings
    close: () => void
    showFullInput: boolean
    addAlert: (str: string, time: number, type?: string) => void
}

type ValidOperators = "+" | "*" | "^";

const MatrixMath = (props: MatrixMathProps) => {
    const [expression, setExpression] = useState("");
    const [resultName, setResultName] = useState("");

    const [overwrite, setOverwrite] = useState(true);
    const [reductionName, setReductionName] = useState("");

    const matrixMath = useExpand() as React.MutableRefObject<HTMLDivElement>;

    const updateParameter = (parameterName: string, updated: string | boolean) => {
        switch(parameterName) {
            case "Overwrite Current Matrix":
                if (typeof updated !== "boolean") return;
                setOverwrite(updated);
                setReductionName("");
                break;
            case "expression":
                if (typeof updated !== "string") return;
                if (/^[a-zA-Z0-9._*^+\-\s()]*$/.test(updated)) {
                    setExpression(updated);
                }
                break;
            case "resultName":
                if (typeof updated !== "string") return;
                if (/^[a-zA-Z_]*$/.test(updated)) {
                    setResultName(updated);
                }
                break;
            case "reductionName":
                if (typeof updated !== "string") return;
                if (/^[a-zA-Z_]*$/.test(updated)) {
                    setReductionName(updated);
                }
                break;
             
            default: return;
        }
    }

    const calculate = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        debugger;
        e.preventDefault();

        if (expression === "") {
            props.addAlert("Please enter an expression using matrix names and these operators: + - * ^", 5000, "error");
            return;
        }
        try {
            //convert expression to postfix array
            const postfix = infixToPostfix(expression);
            console.log(postfix)

            //evaluate postfix array into a number[][]
            const matrix = evaluatePostfix(postfix);
            
            if (matrix !== null)
                props.toStringUpdateMatrix(resultName === "" ? undefined : resultName, matrix)
            else
            props.addAlert("Error calculating expression.", 5000, "error");
        } catch (error) {
            props.addAlert("Error calculating expression.", 5000, "error");
            console.log(error);
        }

    }

    const infixToPostfix = (str: string) => {
        const output: string[] = [];
        const stack: string[] = [];

        let start = -1;
        let end = -1;
        let parsingLetter = false;
        let parsingNum = false;
        let subtractionSeen = false;
        let lastWasOperator = false;
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
                        while (stack[stack.length - 1] !== "(") {
                            let ch = stack.pop();
                            if (ch) 
                                output.push(ch)
                        }

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
                        else if (orderOfOperations(char as ValidOperators) > orderOfOperations(stack[stack.length - 1] as ValidOperators))
                            stack.push(char)
                        else {
                            while (stack.length > 0 && orderOfOperations(char as ValidOperators) <= orderOfOperations(stack[stack.length - 1] as ValidOperators)) {
                                let ch = stack.pop();
                                if (ch)
                                    output.push(ch)
                            }

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

        while (stack.length > 0) {
            let ch = stack.pop();
            if (ch)
                output.push(ch)
        }

        return output

    }

    const evaluatePostfix = (postFix: string[]) => {
        const stack: (number | number[][])[] = []
        for (let i = 0; i < postFix.length; i++) {
            switch (postFix[i]) {
                case "*":
                    var b = stack.pop()
                    var a = stack.pop()
                    if (!a || !b)
                        throw new Error("Stack error");

                    var result = matrixMultiplication(a, b)

                    if (result === null) {
                        throw new Error("Bad dimensions");
                    }

                    stack.push(result)
                    break;
                case "^":
                    b = stack.pop()
                    a = stack.pop()
                    if (!a || !b)
                        throw new Error("Stack error");

                    result = matrixPower(a, b)
                    if (result === null) {
                        throw new Error("Bad dimensions");
                    }

                    stack.push(result)
                    break;
                case "+":
                    b = stack.pop()
                    a = stack.pop()
                    if (!a || !b || !Array.isArray(a) || !Array.isArray(b))
                        throw new Error("Error");

                    result = matrixAddition(b, a)
                    if (result === null) {
                        throw new Error("Bad dimensions");
                    }

                    stack.push(result)
                    break;

                default:
                    if (/^[-]?([0-9]*[.])?[0-9]+$/.test(postFix[i]))
                        stack.push(parseFloat(postFix[i]));
                    else {
                        let negative = false;

                        let matrix: string[][];
                        if (postFix[i].charAt(0) === "-") {
                            matrix = cloneMatrix(props.matrices[postFix[i].substring(1)])
                            negative = true;
                        } else
                            matrix = props.matrices[postFix[i]]

                        let name = postFix[i]
                        if (negative)
                            name = name.substring(1)

                        if (!(name in props.matrices)) {
                            throw new Error("Matrix not found")
                        }

                        let parsedMatrix = cloneAndParseNums(matrix); //replace sparseVals and parse floats
                        if (parsedMatrix === null) {
                            throw new Error("An element was NaN")
                        } else {
                            if (negative) {
                                let result = matrixMultiplication(parsedMatrix, -1)
                                if (Array.isArray(result))
                                    parsedMatrix = result
                                else
                                    throw new Error("Multiplication error");
                            }

                            stack.push(parsedMatrix)
                        }
                    }
                    break;
                }   
        }


        if (!Array.isArray(stack[0]))
            return null;
        else 
            return stack[0]
    }


    const orderOfOperations = (operator: "+" | "*" | "^") => {
        if (operator === "+")
            return 0
        if (operator === "*" || operator === "^")
            return 1
            
        return -1
    }

    const matrixPower = (a: number[][] | number, pow: number[][] | number) => {
        if (Array.isArray(pow)) {
            throw new Error("Power can not be a matrix")
        }

        if (typeof (a) === "number") {
            return Math.pow(a, pow); //num to num 2 ^ 2
        }

        if (pow < 0) {
            var product: number[][] = inverse(a); //invert for negative powers
            a = cloneMatrix(product);
            pow *= -1; 
        } else if (pow === 0) {
            let identity = createIdentity(a.length - 1); //identity matrix for 0 power
            if (identity)
                return identity
            else
                throw new Error("Invalid?")
        } 
        
        product = cloneMatrix(a);
        
        while (pow > 1) {
            if (pow % 2 === 1) {
                let res = matrixMultiplication(product, a);
                if (Array.isArray(res))
                    product = res
                pow--;
            } else {
                let res = matrixMultiplication(product, product); //  (A^2)^(n/2)
                if (Array.isArray(res))
                    product = res
                pow /= 2;
            }
        }

        return product;
    }

    const matrixMultiplication = (a: number | number[][], b: number | number[][]) => {
        if (typeof (a) === "number" && typeof (b) === "number") {
            return a * b; //scalar multiplication
        } else if (Array.isArray(a) && typeof (b) === "number") {
            var product: number[][] = cloneMatrix(a); //deep copy matrix

            for (let i = 0; i < a.length - 1; i++)
                for (let j = 0; j < a[0].length - 1; j++)
                    product[i][j] *= b; //matrix scalar multiplication

            return product
        } else if (typeof (a) === "number" && Array.isArray(b)) {
            product = cloneMatrix(b); //deep copy matrix
            for (let i = 0; i < b.length - 1; i++)
                for (let j = 0; j < b[0].length - 1; j++)
                    product[i][j] *= a; //matrix scalar multiplication

            return product
        } else if (Array.isArray(a) && Array.isArray(b)){
            //matrix multiplication
            if (a.length !== b[0].length)
                throw new Error("Invalid dimensions");

            product = new Array(a.length).fill([]).map(() => new Array(b[0].length).fill(0));

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
        } else 
            throw new Error("?");
    }

    const matrixAddition = (a: number[][], b: number[][]) => {
        if (a.length !== b.length || a[0].length !== b[0].length) { //check dimensions
            throw new Error("Invalid dimensions")
        }

        const matrixSum = new Array(a.length).fill(null).map(() => new Array(a[0].length).fill(""));

        for (let i = 0; i < a.length - 1; i++) {
            for (let j = 0; j < b[0].length - 1; j++) {
                matrixSum[i][j] = a[i][j] + b[i][j]
            }
        }

        return matrixSum;
    }


    const cloneAndParseNums = (matrix: string[][]): number[][] | null => {
        const clone = cloneMatrix(matrix)

        for (let i = 0; i < clone.length - 1; i++) {
            for (let j = 0; j < clone[0].length - 1; j++) {
                let text = clone[i][j]
                if (text === "")
                    text = props.settings["Empty Element"]
                    
    
                if (/^[-]?([0-9]*[.])?[0-9]+$/.test(text)) {
                    clone[i][j] = parseFloat(text)
    
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


    

    const [numMatrix, L, U, determinant] = useMemo(() => {
        const numMatrix = cloneAndParseNums(props.matrix)
        
        if (numMatrix === null) {
            return [null, null, null, null]
        }

        const [L, U, sign] = LUDecomposition(numMatrix)
        let determinant = sign;
        if (L === null || U === null) {
            determinant = 0;
        } else {
            for (let i = 0; i < U.length - 1; i++)
                determinant *= U[i][i]
        }

        return [numMatrix, L, U, determinant]
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.matrix, props.settings["Empty Element"]]);
    
    
    const placeholderName = generateUniqueName(props.matrices);
    const isSquare = props.matrix.length === props.matrix[0].length

    if (overwrite)
        var newName = props.name;
    else if (reductionName === "")
        newName = placeholderName;
    else
        newName = reductionName

    return <div className={"fixed-bottom " + styles.matrixMathContainer} style = {{"bottom": props.showFullInput ? "28px" : "0"}} ref = {matrixMath}>
       
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
                    <BasicActionButton buttonStyle = {"primary"} name = "RREF" action = {() => {
                        props.toStringUpdateMatrix(newName, gaussian(numMatrix))
                    }}/>
                    
                    {isSquare && determinant !== 0 ?
                    <>
                        <BasicActionButton buttonStyle = {"primary"} name = "L" action = {() => {
                            if (L) 
                                props.toStringUpdateMatrix(newName, L)
                        }}/>
                        <BasicActionButton buttonStyle = {"primary"} name = "U" action = {() => {
                            if (U)
                                props.toStringUpdateMatrix(newName, U);
                        }}/>

                        <BasicActionButton buttonStyle = {"primary"} name = "Inverse" action = {() => {
                            props.toStringUpdateMatrix(newName, inverse(numMatrix))
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
        <Toggle toggle={props.close} show={false} />
    </div>



}




export default MatrixMath;
