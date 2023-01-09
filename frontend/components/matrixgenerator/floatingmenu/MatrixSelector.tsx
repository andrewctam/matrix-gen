import React, { useState } from "react";
import SelectorButton from "./SelectorButton";
import styles from "./Selectors.module.css"

import {resizeMatrix} from "../../matrixFunctions"
import { Matrices, renameMatrix, updateMatrix, updateSelection } from "../../../features/matrices-slice";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";

interface MatrixSelectorProps {
    multiSelected: string[]
    setMultiSelected: (arr: string[]) => void
    addAlert: (str: string, time: number, type?: string) => any
}

const MatrixSelector = (props: MatrixSelectorProps) => {
    const [searchName, setSearchName] = useState("");
    const [searchSize, setSearchSize] = useState("");

    const {matrices, selection} = useAppSelector((state) => state.matricesData)
    const {mergeConflict, userMatrices} = useAppSelector((state) => state.user)
    const matrixDispatch =  useAppDispatch();

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
        const matrix = matrices[name];
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
        } else if (newName in matrices) {
            props.addAlert(`The name ${newName} already exists!`, 5000, "error")
            return false;
        } else {         
            matrixDispatch(renameMatrix({"oldName": oldName, "newName": newName}))
            matrixDispatch(updateSelection(newName))

            return true;
        }

    }

    const pushNewSize = (name: string, newSize: string) => {
        if (/[0-9]* ?x ?[0-9]*/.test(newSize)) {
            const rows = parseInt(newSize.substring(0, newSize.indexOf("x")));
            const cols = parseInt(newSize.substring(newSize.indexOf("x") + 1));

            if (rows > 0 && cols > 0) {
                const resized = resizeMatrix(matrices[name], rows + 1, cols + 1)
                if (resized) {
                    matrixDispatch(updateMatrix({"name": name, "matrix": resized}))
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
    if (mergeConflict && userMatrices) {
        // @ts-ignore: Object is possibly 'null'. props.userMatrices below can't be null.
        intersection = Object.keys(matrices).filter(x => props.userMatrices.hasOwnProperty(x));
    }

    let selectors: JSX.Element | JSX.Element[];
    if (matrices === null || Object.keys(matrices).length === 0)
        selectors = <div className={styles.noMatrices}>{"No Matrices Created"}</div>
    else {
        //map matrices to selectors
        selectors = []
        for (const matrixName in matrices) {
            if ((searchName === "" || matrixName.toUpperCase().startsWith(searchName.toUpperCase())) &&
                (searchSize === "" || verifySize(matrixName, sizeFilters)))
                selectors.push(
                    <SelectorButton
                        key={matrixName}
                        name={matrixName}

                        rows = {matrices[matrixName].length - 1}
                        cols = {matrices[matrixName][0].length - 1}

                        toggleMultiSelect = {toggleMultiSelect}
                        pushNewName={pushNewName}
                        pushNewSize={pushNewSize}

                        active={selection === matrixName}
                        multiSelected={props.multiSelected.includes(matrixName)}
                        intersectionMerge={mergeConflict && intersection.includes(matrixName)}
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