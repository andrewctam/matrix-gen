import React, { useRef, useState } from 'react';

import styles from "./SelectorButton.module.css"

import { resizeMatrix } from '../../matrixFunctions';

const SelectorButton = (props) => {
    const [displayName, setDisplayName] = useState(props.name);
    const [displaySize, setDisplaySize] = useState("");
    const resizeInput = useRef(null);
    const nameInput = useRef(null);

    const realSize = () => {
        return (props.matrices[props.name].length - 1) + " x " + (props.matrices[props.name][0].length - 1);
    }

    const updateRename = (e) => {
        const updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated))
            setDisplayName(updated);
    }

    const updateResize = (e) => {
        const updated = e.target.value;
        if (/^[0-9 \s]*[x]?[0-9 \s]*$/.test(updated))
            setDisplaySize(updated);
    }

    const pushNewName = () => {debugger;
        if (displayName !== props.name)
            if (displayName === "") {
                alert("The name can not be blank!")
                setDisplayName(props.name);
            } else if (displayName in props.matrices) {
                alert(`The name ${displayName} already exists!`)
                setDisplayName(props.name);
            } else {         
                props.renameMatrix(props.name, displayName)
                props.setSelection(displayName)
            }
    }

    const pushNewSize = () => {
        if (/[0-9]* ?x ?[0-9]*/.test(displaySize)) {
            const rows = parseInt(displaySize.substring(0, displaySize.indexOf("x")));
            const cols = parseInt(displaySize.substring(displaySize.indexOf("x") + 1));

            if (rows > 0 && cols > 0) {
                setDisplaySize((rows) + " x " + cols);
                const resized = resizeMatrix(props.matrix, rows + 1, cols + 1)
                if (resized)
                    props.setMatrix(props.name, resized);

            } else {
                alert("Dimensions can not be zero");
                setDisplaySize(realSize());
            }
        } else {
            setDisplaySize(realSize());
        }
    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.target.blur();
        }
    }


    if (document.activeElement === resizeInput.current) {
        var size = displaySize
    } else {
        size = realSize();

    }


    if (props.intersectionMerge) {
        var specialText = styles.intersectionMerge;
    } else 
        specialText = "";



    return <button type="button"
        className={styles.matrixSelector +  " list-group-item list-group-item-action" + ((props.active) ? " active" : "")}
        onClick={() => {props.setSelection(props.name)}}>

        <input
            value={displayName}
            ref = {nameInput}
            id={props.name}
            type="text"
            className={styles.selectorInput + " " + styles.renameInput + " " + specialText}
            onChange={updateRename}
            onKeyDown={handleKeyDown}
            onBlur={pushNewName}
        />


        <input
            value={size}
            ref = {resizeInput}
            id={"size " + props.name}
            type="text"
            className={styles.selectorInput + " " + styles.sizeInput}
            onChange={updateResize}
            onBlur={pushNewSize}
            onKeyDown={handleKeyDown}
        />
    </button>



}

export default SelectorButton;