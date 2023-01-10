import React, { useState, useMemo, useRef, ReactText, useEffect, useContext  } from 'react';
import styles from "./MatrixMath.module.css"

import { generateUniqueName } from '../../../matrixFunctions';
import Toggle from '../../../buttons/Toggle';
import BasicActionButton from '../../../buttons/BasicActionButton';
import useExpand from '../../../../hooks/useExpand';

import { updateAllMatrices, updateMatrix } from '../../../../features/matrices-slice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/hooks';
import { AlertContext } from '../../../App';

interface MatrixMathProps {
    close: () => void
    showFullInput: boolean
}


const MatrixMath = (props: MatrixMathProps) => {
    const {matrices, selection} = useAppSelector((state) => state.matricesData);
    const settings = useAppSelector((state) => state.settings);
    const dispatch = useAppDispatch();

    const [expression, setExpression] = useState("");
    const [resultName, setResultName] = useState("");
    const [determinant, setDeterminant] = useState<number | null>(null);
    const [error, setError] = useState(false);
    const matrix = selection in matrices ? matrices[selection] : null

    const addAlert = useContext(AlertContext);

    useEffect(() => {
        if (!matrix || matrix.length === 0 || matrix[0].length === 0 || matrix.length !== matrix[0].length) {
            setDeterminant(null);
            return;
        }

        calculateDecomp("determinant");
    }, [matrix])

    const matrixMath = useExpand() as React.MutableRefObject<HTMLDivElement>;

    const placeholderName = generateUniqueName(matrices);
    const isSquare = matrix && matrix.length === matrix[0].length;

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
            addAlert("Please enter an expression", 5000, "error");
            return;
        }

        if (settings["Decimals To Round"] === "") {
            addAlert("Please enter the number of decimals to round to in the settings", 5000, "error");
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
                matrices: JSON.stringify(matrices),
                sparseVal: settings["Empty Element"],
                round: settings["Decimals To Round"]
            })
        }).then((response) => {
            if (response === undefined) {
                addAlert("Can not connect to server", 5000, "error");
                setError(true)
                setDeterminant(null);
                return null;
            }
            if (response.status === 400) {
                addAlert("Expression could not be evaluated", 5000, "error");
                return null;
            }

            return response.json()
        }).catch(error => {
            addAlert("Can not connect to server", 5000, "error");
            setError(true)
            setDeterminant(null);
            console.log(error)
            return null;
        })

        if (response === null) 
            return;

        const matrix = JSON.parse(response.result)
        console.log(matrix)

        let saveName = "";
        if (resultName !== "")
            saveName = resultName;
        else
            saveName = placeholderName;

        dispatch(updateMatrix({ "name": saveName, "matrix": matrix}))
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
                matrix: JSON.stringify(matrix),
                sparseVal: settings["Empty Element"],
                round: settings["Decimals To Round"]
            })
        }).then((response) => {
            if (response.status === 400) {
                addAlert(`Invalid matrix for ${decomp} decomposition`, 5000, "error");
                return null;
            }

            return response.json()
        }).catch(error => {
            addAlert("Can not connect to server", 5000, "error");
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
                    addAlert(`Invalid matrix for ${decomp} decomposition`, 5000, "error");
                return;
            }
                
            let tempObj = {...matrices}
            let names = []
            for (const [key, value] of Object.entries(decompMatrices)) {
                let name = `${selection}_${key}`;
                
                while (name in matrices) {
                    name += "_";
                }
    
                names.push(name);
                tempObj[name] = value;
            }

            dispatch(updateAllMatrices({ "matrices": tempObj }));

            addAlert(`Results added to matrices!`, 5000, "success");
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
