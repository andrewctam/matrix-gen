import { useState } from "react";
import SelectorButton from "./SelectorButton";
import styles from "./Selectors.module.css"

import {resizeMatrix} from "../matrixFunctions"

const MatrixSelector = (props) => {
    const [searchName, setSearchName] = useState("");
    const [searchSize, setSearchSize] = useState("");

    const updateSearchName = (e) => {
        const updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated)) //only allow letters and underscores
            setSearchName(updated);
    }

    const updateSearchSize = (e) => {
        const updated = e.target.value;
        if (/^[0-9 \s]*[x]?[0-9 \s]*$/.test(updated)) //only allow digits and one instance of "x"
            setSearchSize(updated);
    }

    const verifySize = (name, sizeFilters) => {
        const matrix = props.matrices[name];
        const rows = matrix.length - 1;
        const cols = matrix[0].length - 1;

        if (sizeFilters.length === 1) //only a number entered
            return rows === sizeFilters[0] || cols === sizeFilters[0]
        else //n x m entered
            return rows === sizeFilters[0] && cols === sizeFilters[1];
    }

    const toggleMultiSelect = (name, clear = false) => {
        if (name == null && clear)
            props.setMultiSelected([]);
        else if (props.multiSelected.includes(name))
            props.setMultiSelected(props.multiSelected.filter((n) => n !== name));
        else
            props.setMultiSelected([...props.multiSelected, name]);
    }
                


    const pushNewName = (oldName, newName) => {
        if (oldName === newName)
            return false;
        else if (newName === "") {
            props.addAlert("The name can not be blank!", 5000, "error")
            return false;
        } else if (newName in props.matrices) {
            props.addAlert(`The name ${newName} already exists!`, 5000, "error")
            return false;
        } else {         
            props.matrixDispatch({"type": "RENAME_MATRIX", payload: {"oldName": oldName, "newName": newName}})
            props.setSelection(newName)
            return true;
        }

    }

    const pushNewSize = (name, newSize) => {
        if (/[0-9]* ?x ?[0-9]*/.test(newSize)) {
            const rows = parseInt(newSize.substring(0, newSize.indexOf("x")));
            const cols = parseInt(newSize.substring(newSize.indexOf("x") + 1));

            if (rows > 0 && cols > 0) {
                const resized = resizeMatrix(props.matrices[name], rows + 1, cols + 1)
                if (resized) {
                    props.matrixDispatch({type: "UPDATE_MATRIX", payload: {"name": name, "matrix": resized}});
                    return true;
                } else {
                    props.addAlert("Enter a valid number for rows and columns", 5000, "error");
                    return false;
                }

            } else {
                props.addAlert("Dimensions can not be zero", 5000, "error");
                return false;
            }
        } else {
            return false;
        }
    }

    if (props.matrices === null || Object.keys(props.matrices).length === 0)
        var selectors = <div className={styles.noMatrices}>{"No Matrices Created"}</div>

    const sizeFilters = [];
    const split = searchSize.split("x"); //extract numbers from n x m
    if (searchSize !== "") {
        for (let i = 0; i < split.length; i++) {
            const temp = parseInt(split[i])
            if (!isNaN(temp))
                sizeFilters.push(temp)
        }
    }

    if (props.showMerge) {
        var intersection = Object.keys(props.matrices).filter(x => props.userMatrices.hasOwnProperty(x));
    }

    //map matrices to selectors
    selectors = []
    for (const matrixName in props.matrices) {
        if ((searchName === "" || matrixName.toUpperCase().startsWith(searchName.toUpperCase())) &&
            (searchSize === "" || verifySize(matrixName, sizeFilters)))
            selectors.push(
                <SelectorButton
                    key={matrixName}
                    name={matrixName}

                    rows = {props.matrices[matrixName].length - 1}
                    cols = {props.matrices[matrixName][0].length - 1}

                    setSelection={props.setSelection}
                    toggleMultiSelect = {toggleMultiSelect}
                    pushNewName={pushNewName}
                    pushNewSize={pushNewSize}

                    active={props.selection === matrixName}
                    multiSelected={props.multiSelected.includes(matrixName)}

                    intersectionMerge={props.showMerge && intersection.includes(matrixName)}
                />
            )
    }


    if (selectors.length === 0)
        selectors = <div className={styles.noMatrices}>{"No Matrices Found"}</div>;
    else
        selectors.sort((selector1, selector2) => {
            return selector1.props.name.toUpperCase() < selector2.props.name.toUpperCase() ? selector1 : selector2;
        });


    return (<div>
            <input className={styles.nameSearchBar} onChange={updateSearchName} value={searchName} placeholder='Search by Name'></input>
            <input className={styles.sizeSearchBar} onChange={updateSearchSize} value={searchSize} placeholder='Search by Size'></input>

            <div id="selectors" className={"list-group " + styles.matrixSelectorContainer}>
                 {selectors}
            </div>
    </div>)
}

export default MatrixSelector