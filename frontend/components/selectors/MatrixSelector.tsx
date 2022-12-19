import React, { useState } from "react";
import SelectorButton from "./SelectorButton";
import styles from "./Selectors.module.css"

import {resizeMatrix} from "../matrixFunctions"
import { Matrices, Settings } from "../App";

interface MatrixSelectorProps {
    matrices: Matrices
    userMatrices: Matrices | null
    name: string
    setSelection: (str: string) => void
    selection: string
    matrixDispatch: React.Dispatch<any>
    showMerge: boolean
    multiSelected: string[]
    setMultiSelected: (arr: string[]) => void
    addAlert: (str: string, time: number, type?: string) => any
}

const MatrixSelector = (props: MatrixSelectorProps) => {
    const [searchName, setSearchName] = useState("");
    const [searchSize, setSearchSize] = useState("");

    const updateSearchName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updated = (e.target as HTMLInputElement).value;
        if (/^[A-Za-z_]*$/.test(updated)) //only allow letters and underscores
            setSearchName(updated);
    }

    const updateSearchSize = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updated = (e.target as HTMLInputElement).value;
        if (/^[0-9 \s]*[x]?[0-9 \s]*$/.test(updated)) //only allow digits and one instance of "x"
            setSearchSize(updated);
    }

    const verifySize = (name: string, sizeFilters: number[]) => {
        const matrix = props.matrices[name];
        const rows = matrix.length - 1;
        const cols = matrix[0].length - 1;

        if (sizeFilters.length === 1) //only a number entered
            return rows === sizeFilters[0] || cols === sizeFilters[0]
        else //n x m entered
            return rows === sizeFilters[0] && cols === sizeFilters[1];
    }

    const toggleMultiSelect = (name: string | undefined) => {
        if (name === undefined)
            props.setMultiSelected([]);
        else if (props.multiSelected.includes(name))
            props.setMultiSelected(props.multiSelected.filter((n) => n !== name));
        else
            props.setMultiSelected([...props.multiSelected, name]);
    }
                


    const pushNewName = (oldName: string, newName: string) => {
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

    const pushNewSize = (name: string, newSize: string) => {
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

    const sizeFilters = [];
    const split = searchSize.split("x"); //extract numbers from n x m
    if (searchSize !== "") {
        for (let i = 0; i < split.length; i++) {
            const temp = parseInt(split[i])
            if (!isNaN(temp))
                sizeFilters.push(temp)
        }
    }

    let intersection: string[] = [];
    if (props.showMerge && props.userMatrices) {
        // @ts-ignore: Object is possibly 'null'. props.userMatrices below can't be null.
        intersection = Object.keys(props.matrices).filter(x => props.userMatrices.hasOwnProperty(x));
    }

    let selectors: JSX.Element | JSX.Element[];
    if (props.matrices === null || Object.keys(props.matrices).length === 0)
        selectors = <div className={styles.noMatrices}>{"No Matrices Created"}</div>
    else {
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
                return selector1.props.name.toUpperCase().localeCompare(selector2.props.name.toUpperCase());
            });
    }


    return (<div>
            <input className={styles.nameSearchBar} onChange={updateSearchName} value={searchName} placeholder='Search by Name'></input>
            <input className={styles.sizeSearchBar} onChange={updateSearchSize} value={searchSize} placeholder='Search by Size'></input>

            <div id="selectors" className={"list-group " + styles.matrixSelectorContainer}>
                 {selectors}
            </div>
    </div>)
}

export default MatrixSelector