import React, { useState, useMemo, useRef, ReactText, useEffect  } from 'react';
import styles from "./MatrixMath.module.css"

import { generateUniqueName, cloneMatrix, gaussian, LUDecomposition, inverse, createIdentity} from '../../../matrixFunctions';
import Toggle from '../../../buttons/Toggle';
import BasicActionButton from '../../../buttons/BasicActionButton';
import useExpand from '../../../../hooks/useExpand';
import { Matrices, MatricesAction, Settings } from '../../../App';

interface MatrixMathProps {
    matrices: Matrices
    matrix: string[][]
    name: string
    matrixDispatch: React.Dispatch<MatricesAction>

    toStringUpdateMatrix: (name: string | undefined, matrix: number[][]) => void
    settings: Settings
    close: () => void
    showFullInput: boolean
    addAlert: (str: string, time: number, type?: string) => void
    username: string
}


const MatrixMath = (props: MatrixMathProps) => {
    const [expression, setExpression] = useState("");
    const [resultName, setResultName] = useState("");
    const [determinant, setDeterminant] = useState<number | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (props.matrix.length === 0 || props.matrix[0].length === 0 || props.matrix.length !== props.matrix[0].length) {
            setDeterminant(null);
            return;
        }

        calculateDecomp("determinant");
    }, [props.matrix])

    const matrixMath = useExpand() as React.MutableRefObject<HTMLDivElement>;

    const placeholderName = generateUniqueName(props.matrices);
    const isSquare = props.matrix.length === props.matrix[0].length;

    const updateParameter = (parameterName: string, updated: string | boolean) => {
        switch(parameterName) {
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
             
            default: return;
        }
    }

    const calculateExpression = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (expression === "") {
            props.addAlert("Please enter an expression", 5000, "error");
            return;
        }

        if (props.settings["Decimals To Round"] === "") {
            props.addAlert("Please enter the number of decimals to round to in the settings", 5000, "error");
            return;
        }

        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/math/expression`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                expression: expression,
                matrices: JSON.stringify(props.matrices),
                sparseVal: props.settings["Empty Element"],
                round: props.settings["Decimals To Round"]
            })
        }).then((response) => {
            if (response === undefined) {
                props.addAlert("Can not connect to server", 5000, "error");
                setError(true)
                setDeterminant(null);
                return null;
            }
            if (response.status === 400) {
                props.addAlert("Expression could not be evaluated", 5000, "error");
                return null;
            }

            return response.json()
        }).catch(error => {
            props.addAlert("Can not connect to server", 5000, "error");
            setError(true)
            setDeterminant(null);
            console.log(error)
            return null;
        })

        if (response === null) 
            return;

        const matrix = JSON.parse(response.result)
        console.log(matrix)

        props.matrixDispatch({ "type": "UPDATE_MATRIX", payload: {"name": resultName !== "" ? resultName : placeholderName, "matrix": matrix, "switch": true} });
            
    }


    type DecompPayload = {
        [key: string]: string[][]
    }
    
    const calculateDecomp = async (decomp: string) => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/math/${decomp}`;            
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                matrix: JSON.stringify(props.matrix),
                sparseVal: props.settings["Empty Element"],
                round: props.settings["Decimals To Round"]
            })
        }).then((response) => {
            if (response.status === 400) {
                props.addAlert(`Invalid matrix for ${decomp} decomposition`, 5000, "error");
                return null;
            }

            return response.json()
        }).catch(error => {
            props.addAlert("Can not connect to server", 5000, "error");
            setError(true)
            console.log(error)
            return null;
        })

        if (response === null) 
            return;
            
        console.log(response)
        if (decomp === "determinant") 
            setDeterminant(JSON.parse(response.result))
        else {
            let decompMatrices: DecompPayload = JSON.parse(response.result)

            if (decompMatrices === null) {
                if (decomp === "determinant")
                    props.addAlert(`Invalid matrix for ${decomp} decomposition`, 5000, "error");
                return;
            }
                
            let tempObj = {...props.matrices}
            let names = []
            for (const [key, value] of Object.entries(decompMatrices)) {
                let name = `${props.name}_${key}`;
                
                while (name in props.matrices) {
                    name += "_";
                }
    
                names.push(name);
                tempObj[name] = value;
            }
    
            props.matrixDispatch({ type: "UPDATE_ALL", payload: { "matrices": tempObj } });
            props.addAlert(`Results added to matrices!`, 5000, "success");
        }

    }

    
    
    
    if (error) {
        return <div className={"fixed-bottom " + styles.matrixMathContainer} style = {{"bottom": props.showFullInput ? "28px" : "0"}} ref = {matrixMath}>
            <p className = {styles.title}>
                Can not connect to server
            </p>
        </div>    
    }
    return <div className={"fixed-bottom " + styles.matrixMathContainer} style = {{"bottom": props.showFullInput ? "28px" : "0"}} ref = {matrixMath}>
       
        <div className="row">
            <form onSubmit={calculateExpression} className="col-sm-6">
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

                <button className={"btn btn-success " + styles.mathEvalButton} onClick={calculateExpression}>Evaluate Expression</button>
            </form>

            <div className='col-sm-6'>
                <h2 className = {styles.title}>Matrix Decompositions</h2>        
                <p>Results will be saved as new matrices</p>

                <ul>
                    <BasicActionButton name = "RREF" action = {() => { calculateDecomp("rref") }} buttonStyle = {"primary"} disabled = {false}/>
                    <BasicActionButton name = "Inverse" action = {() => { calculateDecomp("inverse") }} buttonStyle = {"primary"} disabled = {!determinant}/>
                    <BasicActionButton name = "LU" action = {() => { calculateDecomp("LU") }} buttonStyle = {"primary"} disabled = {!isSquare}/>
                    <BasicActionButton name = "QR" action = {() => { calculateDecomp("QR") }} buttonStyle = {"primary"} disabled = {!isSquare}/>
                    <BasicActionButton name = "SVD" action = {() => { calculateDecomp("SVD") }} buttonStyle = {"primary"} disabled = {!isSquare}/>
                    <BasicActionButton name = "Cholesky" action = {() => { calculateDecomp("cholesky") }} buttonStyle = {"primary"} disabled = {!isSquare}/>
                    <BasicActionButton name = "Eigen" action = {() => { calculateDecomp("eigen") }} buttonStyle = {"primary"} disabled = {!isSquare}/>

                    <div className = {styles.detInfo}>
                        {determinant ?
                        `Determinant: ${determinant}` 
                        :
                        "Matrix is not singular."
                        }
                    </div>
                </ul>
            

            </div>



        </div>
        <Toggle toggle={props.close} show={false} />
    </div>



}




export default MatrixMath;
