import React, { useState } from 'react';

import { transpose, shuffle, mirrorRowsCols, fillEmpty, fillXY, fillAll, fillDiagonal, randomMatrix, scatter, rotate90Degrees, reshapeMatrix, resizeMatrix } from '../../matrixFunctions';
import styles from "./MatrixActions.module.css"

import BasicActionButton from '../../buttons/BasicActionButton.js';
import TextActionButton from '../../buttons/TextActionButton';
import TwoTextActionButton from '../../buttons/TwoTextActionButton';

import Toggle from '../../buttons/Toggle';

const MatrixActions = (props) => {
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

    const updateParameter = (parameterName, updated) => {
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


    return <div className={"fixed-bottom row " + styles.matrixActionsContainer}
        style={{ "bottom": props.showFullInput ? "28px" : "0" }}>
        <div className="col-sm-4">
            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    props.updateMatrix(props.name, transpose(props.matrix))
                }}
                name={"Transpose"}
            />
            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    props.updateMatrix(props.name, rotate90Degrees(props.matrix)) //false means cols to rows
                }}
                name={"Rotate 90 ↻"}
            />

            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    props.updateMatrix(props.name, shuffle(props.matrix)) //false means cols to rows
                }}
                name={"Shuffle"}
            />

            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    props.updateMatrix(props.name, mirrorRowsCols(props.matrix, true))
                }}
                name={"Mirror Rows Across Diagonal"}
            />
            <BasicActionButton
                buttonStyle = {"primary"} 
                action={() => {
                    props.updateMatrix(props.name, mirrorRowsCols(props.matrix, false)) //false means cols to rows
                }}
                name={"Mirror Columns Across Diagonal"}
            />


        </div>

        <div className="col-sm-4">

            <TextActionButton
                name="Fill Empty With: "
                action={() => {
                    props.updateMatrix(props.name, fillEmpty(props.matrix, fillEmptyWithThis))
                }}
                updateParameter={updateParameter}
                width={"40px"}
                value={fillEmptyWithThis}
            />

            <TextActionButton
                name="Fill All With: "
                action={() => {
                    props.updateMatrix(props.name, fillAll(props.matrix, fillAllWithThis))
                }}
                updateParameter={updateParameter}
                width={"40px"}
                value={fillAllWithThis}
            />

            <TextActionButton
                name="Fill Diagonal With: "
                action={() => {
                    props.updateMatrix(props.name, fillDiagonal(props.matrix, fillDiagonalWithThis))
                }}
                updateParameter={updateParameter}
                width={"40px"}
                value={fillDiagonalWithThis}
            />

            <TwoTextActionButton
                name="Replace X With Y: "
                action={() => {
                    props.updateMatrix(props.name, fillXY(props.matrix, replaceX, replaceY))
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
                    if (reshapeRows > 100 || reshapeCols > 100) {
                        alert("The max matrix size is 100 x 100")
                        return;
                    }
                    const reshaped = reshapeMatrix(props.matrix, parseInt(reshapeRows), parseInt(reshapeCols))
                    if (reshaped)
                        props.updateMatrix(props.name, reshaped)
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
                    if (resizeRows > 100 || resizeCols > 100) {
                        alert("The max matrix size is 100 x 100")
                        return;
                    }
                    const resized = resizeMatrix(props.matrix, parseInt(resizeRows) + 1, parseInt(resizeCols) + 1)
                    if (resized)
                        props.updateMatrix(props.name, resized)
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
                    const random = randomMatrix(props.matrix, parseInt(randomLow), parseInt(randomHigh))

                    if (random)
                        props.updateMatrix(props.name, random)
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
                    const scattered = scatter(props.matrix, parseInt(scatterLow), parseInt(scatterHigh), 0.25)

                    if (scattered)
                        props.updateMatrix(props.name, scattered)
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



        <Toggle toggle={props.close} show={!props.active} />

    </div>
}


export default MatrixActions;