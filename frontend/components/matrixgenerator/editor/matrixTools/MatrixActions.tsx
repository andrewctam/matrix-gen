import { useState } from 'react';

import { transpose, shuffle, mirrorRowsCols, fillEmpty, fillXY, fillAll, fillDiagonal, randomMatrix, scatter, rotate90Degrees, reshapeMatrix, resizeMatrix } from '../../../matrixFunctions';
import styles from "./MatrixActions.module.css"

import BasicActionButton from '../../../buttons/BasicActionButton';
import TextActionButton from '../../../buttons/TextActionButton';
import TwoTextActionButton from '../../../buttons/TwoTextActionButton';

import Toggle from '../../../buttons/Toggle';
import useExpand from '../../../../hooks/useExpand';
import { updateMatrix } from '../../../../features/matrices-slice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/hooks';

interface MatrixActionsProps {
    close: () => void
    showFullInput: boolean
    addAlert: (str: string, time: number, type?: string) => void
}

const MatrixActions = (props: MatrixActionsProps) => {
    const [randomLow, setRandomLow] = useState("1");
    const [randomHigh, setRandomHigh] = useState("10");
    const [scatterLow, setScatterLow] = useState("1");
    const [scatterHigh, setScatterHigh] = useState("5");
    const [reshapeRows, setReshapeRows] = useState("");
    const [reshapeCols, setReshapeCols] = useState("");
    const [resizeRows, setResizeRows] = useState("");
    const [resizeCols, setResizeCols] = useState("");
    const [fillEmptyWithThis, setFillEmptyWithThis] = useState("0");
    const [fillAllWithThis, setFillAllWithThis] = useState("");
    const [fillDiagonalWithThis, setFillDiagonalWithThis] = useState("1");
    const [replaceX, setReplaceX] = useState("");
    const [replaceY, setReplaceY] = useState("");

    const {selection, matrices} = useAppSelector((state) => state.matricesData)
    const matrixDispatch = useAppDispatch();

    const matrixActions = useExpand() as React.MutableRefObject<HTMLDivElement>;

    const updateParameter = (parameterName: string, updated: string) => {
        switch (parameterName) {
            case "Fill Empty With: ":
                setFillEmptyWithThis(updated);
                break;
            case "Fill All With: ":
                setFillAllWithThis(updated);
                break;
            case "Fill Diagonal With: ":
                setFillDiagonalWithThis(updated);
                break;
            case "randomLow":
                if (/^-?[0-9 \s]*$/.test(updated))
                    setRandomLow(updated);
                break;
            case "randomHigh":
                if (/^-?[0-9 \s]*$/.test(updated))
                    setRandomHigh(updated);
                break;
            case "scatterLow":
                if (/^-?[0-9 \s]*$/.test(updated))
                    setScatterLow(updated);
                break;
            case "scatterHigh":
                if (/^-?[0-9 \s]*$/.test(updated))
                    setScatterHigh(updated);
                break;
            case "reshapeRows":
                if (/^[0-9 \s]*$/.test(updated))
                    setReshapeRows(updated);
                break;
            case "reshapeCols":
                if (/^[0-9 \s]*$/.test(updated))
                    setReshapeCols(updated);
                break;
            case "resizeRows":
                if (/^[0-9 \s]*$/.test(updated))
                    setResizeRows(updated);
                break;
            case "resizeCols":
                if (/^[0-9 \s]*$/.test(updated))
                    setResizeCols(updated);
                break;
            case "replaceX":
                setReplaceX(updated);
                break;
            case "replaceY":
                setReplaceY(updated);
                break;



            default: break;

        }

    }

    const matrix = selection in matrices ? matrices[selection] : null
    if (!matrix)
        return null;

    return <div className={"fixed-bottom row " + styles.matrixActionsContainer}
        ref = {matrixActions}
        style={{ "bottom": props.showFullInput ? "28px" : "0" }}>
        <div className="col-sm-4">
            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    matrixDispatch(updateMatrix({name: selection, matrix: transpose(matrix)}))
                }}
                name={"Transpose"}
            />
            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    matrixDispatch(updateMatrix({name: selection, matrix: rotate90Degrees(matrix)}))
                }}
                name={"Rotate 90 ↻"}
            />

            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    matrixDispatch(updateMatrix({name: selection, matrix: shuffle(matrix)}))
                }}
                name={"Shuffle"}
            />

            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    matrixDispatch(updateMatrix({name: selection, matrix: mirrorRowsCols(matrix, true)}))
                }}
                name={"Mirror Rows Across Diagonal"}
            />
            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    matrixDispatch(updateMatrix({name: selection, matrix: mirrorRowsCols(matrix, false)}))
                }}
                name={"Mirror Columns Across Diagonal"}
            />


        </div>

        <div className="col-sm-4">

            <TextActionButton
                name="Fill Empty With: "
                action={() => {
                    matrixDispatch(updateMatrix({name: selection, matrix: fillEmpty(matrix, fillEmptyWithThis)}))
                }}
                updateParameter={updateParameter}
                width={"40px"}
                value={fillEmptyWithThis}
            />

            <TextActionButton
                name="Fill All With: "
                action={() => {
                    matrixDispatch(updateMatrix({name: selection, matrix: fillAll(matrix, fillAllWithThis)}))
                }}
                updateParameter={updateParameter}
                width={"40px"}
                value={fillAllWithThis}
            />

            <TextActionButton
                name="Fill Diagonal With: "
                action={() => {
                    matrixDispatch(updateMatrix({name: selection, matrix: fillDiagonal(matrix, fillDiagonalWithThis)}))
                }}
                updateParameter={updateParameter}
                width={"40px"}
                value={fillDiagonalWithThis}
            />

            <TwoTextActionButton
                name="Replace X With Y: "
                action={() => {
                    matrixDispatch(updateMatrix({name: selection, matrix: fillXY(matrix, replaceX, replaceY)}))
                }}
                updateParameter={updateParameter}
                id1={"replaceX"}
                placeholder1={"X"}
                id2={"replaceY"}
                placeholder2={"Y"}
                value1={replaceX}
                value2={replaceY}
                separator={" → "}
                width={"40px"}
            />


        </div>
        <div className="col-sm-4">

            <TwoTextActionButton
                name="Reshape To: "
                action={() => {
                    if (parseInt(reshapeRows) > 100 || parseInt(reshapeCols) > 100) {
                        props.addAlert("The max matrix size is 100 x 100", 5000, "error")
                        return;
                    }
                    const reshaped = reshapeMatrix(matrix, parseInt(reshapeRows), parseInt(reshapeCols))
                    if (reshaped)
                        matrixDispatch(updateMatrix({name: selection, matrix: reshaped}))
                    else 
                        props.addAlert("Enter valid numbers for rows and columns.", 5000, "error")
                }}
                updateParameter={updateParameter}
                id1={"reshapeRows"}
                id2={"reshapeCols"}
                value1={reshapeRows}
                value2={reshapeCols}
                separator={" x "}
                width={"40px"}
            />

            <TwoTextActionButton
                name="Resize To: "
                action={() => {
                    if (parseInt(resizeRows) > 100 || parseInt(resizeCols) > 100) {
                        props.addAlert("The max matrix size is 100 x 100", 5000, "error")
                        return;
                    }
                    const resized = resizeMatrix(matrix, parseInt(resizeRows) + 1, parseInt(resizeCols) + 1)
                    if (resized)
                        matrixDispatch(updateMatrix({name: selection, matrix: resized}))
                    else 
                        props.addAlert("Enter a number for rows and columns", 5000, "error");

                }}
                updateParameter={updateParameter}
                id1={"resizeRows"}
                id2={"resizeCols"}
                value1={resizeRows}
                value2={resizeCols}
                separator={" x "}
                width={"40px"}
            />

            <TwoTextActionButton
                name="Randomize Elements: "
                action={() => {
                    const random = randomMatrix(matrix, parseInt(randomLow), parseInt(randomHigh))

                    if (random)
                        matrixDispatch(updateMatrix({name: selection, matrix: random}))
                    else
                        props.addAlert(`Invalid range`, 5000, "error");

                }}
                updateParameter={updateParameter}
                id1={"randomLow"}
                id2={"randomHigh"}
                value1={randomLow}
                value2={randomHigh}
                separator={" to "}
                width={"40px"}
            />

            <TwoTextActionButton
                name="Scatter These Numbers: "
                action={() => {
                    const scattered = scatter(matrix, parseInt(scatterLow), parseInt(scatterHigh))

                    if (scattered)
                        matrixDispatch(updateMatrix({name: selection, matrix: scattered}))
                    else   
                        props.addAlert(`Invalid range`, 5000, "error");

                        
                }}
                updateParameter={updateParameter}
                id1={"scatterLow"}
                id2={"scatterHigh"}
                value1={scatterLow}
                value2={scatterHigh}
                separator={" to "}
                width={"40px"}
            />
        </div>



        <Toggle toggle={props.close} show={false} />

    </div>
}


export default MatrixActions;