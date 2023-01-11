import React, {useEffect, useState, useRef, useContext} from "react";
import styles from "./TextImport.module.css"
import { generateUniqueName } from "../../../matrixFunctions";

import ParameterBoxInput from "../../../inputs/ParameterBoxInput";
import ParameterTextInput from "../../../inputs/ParameterTextInput";
import ActiveButton from '../../../buttons/ActiveButton'

import OverwriteInput from '../../../inputs/OverwriteInput'

import Toggle from '../../../buttons/Toggle';
import useExpand from '../../../../hooks/useExpand';
import { updateMatrix, updateSelection } from "../../../../features/matrices-slice";
import { useAppDispatch, useAppSelector } from "../../../../hooks/hooks";
import { AlertContext } from "../../../App";

interface TextImportProps {
    close: () => void
    showFullInput: boolean
}


const TextImport = (props: TextImportProps) => {
    const { matrices, selection } = useAppSelector((state) => state.matricesData);
    const dispatch = useAppDispatch();

    const [overwrite, setOverwrite] = useState(true);
    const [displayWarning, setDisplayWarning] = useState(true);

    const [newName, setNewName] = useState("");
    const [importFormat, setImportFormat] = useState("Separator");
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
    const [removeEscape, setRemoveEscape] = useState(true);
    const [escapeMap, setEscapeMap] = useState({
        "^":"\\char94",
        "~":"\\char126",
        "\\":"\\char92"
    })

    

    //settings that change based on import format
    const [settingA, setSettingA] = useState(""); //opening bracket, numRows
    const [settingB, setSettingB] = useState(""); //closing bracket, numCols
    const [settingC, setSettingC] = useState(" "); //separator
    const [settingD, setSettingD] = useState("\n"); //new line separator

    const textImport = useExpand() as React.MutableRefObject<HTMLDivElement>;
    const addAlert = useContext(AlertContext);

    useEffect(() => {
        //if one of the setting changes, update if we should display a warning
        let updatedDisplayWarning = displayWarning;
        switch(importFormat) {
            case "Separator":
                updatedDisplayWarning = settingC.includes(" ") || settingD === "\n" || settingD.includes(" ");
                break;
            case "2D Arrays":
                updatedDisplayWarning = settingA.includes(" ") || settingB.includes(" ") || settingC.includes(" ");
                break;
            case "Reshape From One Line":
                updatedDisplayWarning = settingA.includes(" ") || settingB.includes(" ") || settingC.includes(" ");
                break;

            default: break;
        }

        setDisplayWarning(updatedDisplayWarning)

    }, [settingA, settingB, settingC, settingD, importFormat]);


    const updateParameter = (parameterName: string, updated: string | boolean) => {
        switch (parameterName) {
            case "Overwrite Current Matrix":
                if (typeof updated !== "boolean") return;
                setOverwrite(updated);
                setNewName("");
                break;
            case "newName":
                if (typeof updated !== "string") return;
                if (/^[A-Za-z_]*$/.test(updated)) { //only update if valid chars used
                    setNewName(updated);
                }
                break;
            case "settingA":
                if (typeof updated !== "string") return;
                setSettingA(updated);
                break;
            case "settingB":
                if (typeof updated !== "string") return;
                setSettingB(updated);
                break;
            case "settingC":
                if (typeof updated !== "string") return;
                setSettingC(updated);
                break;
            case "settingD":
                if (typeof updated !== "string") return;
                if (updated === "")
                    updated = "\n"
                
                setSettingD(updated);
                break;
            case "Ignore White Space":
                if (typeof updated !== "boolean") return;
                setIgnoreWhitespace(updated);
                break;
            case "Remove Escapes For: #$%&_{}^~\\":
                if (typeof updated !== "boolean") return;
                setRemoveEscape(updated);
                break;  
                

            case "^": 
            case "~": 
            case "\\": 
                    if (typeof updated !== "string") return;
                    const tempObj = {...escapeMap};
                    tempObj[parameterName] = updated;
                    setEscapeMap(tempObj);
                    break;
                
            
            default: break;
        }

    }

    const updateImportFormat = (e: React.MouseEvent<HTMLButtonElement>) => {
        const updated = (e.target as HTMLButtonElement).id;    

        switch(updated) {
            case "Separator":
                setSettingC(" ");
                setSettingD("\n");
                break;
            case "2D Arrays":
                setSettingA("{");
                setSettingB("}");
                setSettingC(",");

                break;
            case "Reshape From One Line":
                setSettingA("1");
                setSettingB("1");
                setSettingC(" ");
                break;
            case "LaTeX":
                break;

            default: break;
        }

        setImportFormat(updated);

    }

    const addRegexEscape = (str: string) => {
        switch(str) { //escapes for regex
            case ".": case "+": case "*": case "?": case "^": case "$": case "(": case ")": case "[": case "]": case "{": case "}": case "|":
                return "\\" + str;

            default: break;
        }

        return str.replaceAll("\\", "\\\\");

        
    }
    const parseText = () => {
        const separator = settingC;
        let textArea = document.getElementById("importTextArea") as HTMLTextAreaElement
        if (!textArea) 
            return;

        let text = textArea.value
        let matrix: string[][] = [];

        if (ignoreWhitespace)
            text = text.replaceAll(/\s/g,"")
        
        if (selection && overwrite) {//overwrite current matrix
            if (selection === "0")
                var name = "A"
            else
                var name = selection;
        } else if (newName === "") //input empty, so auto generate
            name = generateUniqueName(matrices);
        else //name provided
            name = newName;

        switch(importFormat) {
            case "Separator":
                const rowSeparator = settingD;
                //split into rows
                let maxLen = 0;
                var rows = text.split(rowSeparator);
                for (let i = 0; i < rows.length; i++) {
                    matrix.push(rows[i].split(separator));
                    if (matrix[i].length > maxLen)
                        maxLen = matrix[i].length;
                }

                maxLen++; //add one for empty column

                //add empty strings to make all rows the same length
                for (let i = 0; i < rows.length; i++) {
                    while (matrix[i].length < maxLen) {
                        matrix[i].push("");
                    }
                }

                //remove empty rows
                matrix.push(Array(maxLen).fill(""));
                
                break;
                
            case "2D Arrays":
                if (!ignoreWhitespace) //if we have not already removed new lines before 
                    text = text.replaceAll("\n", "");
                try {
                    const firstBrace = text.indexOf(settingA) + 1; //remove {{
                    const lastBrace = text.lastIndexOf(settingB) - 1; //remove {{
                    const noBraces = text.substring(firstBrace + 1, lastBrace);


                    //  finds },{ and removes random characters in between
                    const braceSeparator = new RegExp(`${addRegexEscape(settingB)}.*?${addRegexEscape(separator)}.*?${addRegexEscape(settingA)}`, 'g'); 
                    
                    
                    rows = noBraces.split(braceSeparator);

                    let maxLen = 0;
                    for (let i = 0; i < rows.length; i++) {
                        matrix.push(rows[i].split(separator));
                        if (matrix[i].length > maxLen)
                            maxLen = matrix[i].length;
                    }


                maxLen++; //add one for empty column

                //add empty strings to make all rows the same length
                for (let i = 0; i < rows.length; i++) {
                    while (matrix[i].length < maxLen) {
                        matrix[i].push("");
                    }
                }

                //add empty row
                matrix.push(Array(maxLen).fill(""));
                } catch (error) {
                    console.log(error); 
                    addAlert("Error in input.", 5000, "error");
                }
                
                break;

        
            case "Reshape From One Line":
                const elements = text.split(separator);
                var rowCount = parseInt(settingA);
                var colCount = parseInt(settingB);

                if (isNaN(rowCount) || isNaN(colCount)) { //one is empty or NaN
                    if (isNaN(rowCount) && isNaN(colCount)) {
                        addAlert("Enter rows and columns to reshape", 5000, "error");
                        return;
                    } else if (!isNaN(rowCount)) { //infer cols bsed on rows
                        if (elements.length % rowCount !== 0) {
                            addAlert("Invalid number of rows", 5000, "error");
                            return;
                        }
                        
                        colCount = elements.length / rowCount;
                    } else if (!isNaN(colCount)) { //infer rows based on cols
                        if (elements.length % colCount !== 0) {
                            addAlert("Invalid number of columns", 5000, "error");
                            return;
                        }
                        
                        rowCount = elements.length / colCount;
                    } 
                }

                  
                matrix = Array(rowCount + 1).fill([]).map(()=>Array(colCount + 1).fill(""))

                //go through each element and reshape into a matriz
                let i = 0; //ptr
                for (let j = 0; j < rowCount; j++) {
                    for (let k = 0; k < colCount; k++) {
                        matrix[j][k] = elements[i];
                        i++;
                        
                        if (i >= elements.length)
                            break;
                    }
                    if (i >= elements.length)
                        break;
                }


                break;

            case "LaTeX":
                if (!ignoreWhitespace) //latex always ignore whitespace, so remove if not already done above
                    text = text.replaceAll(/\s/g,"")
                
                rows = text.split("\\\\");
                
                maxLen = 0;

                //split rows by & and find max length
                for (let i = 0; i < rows.length; i++) {    
                    matrix.push(rows[i].split("&"));
                    if (matrix[i].length > maxLen)
                        maxLen = matrix[i].length;
                }
                
                maxLen++; //add one for empty column

                //add empty strings to make all rows the same length
                for (let i = 0; i < rows.length; i++) {
                    while (matrix[i].length < maxLen) {
                        matrix[i].push("");
                    }
                }

                //extra empty row
                matrix.push(Array(maxLen).fill(""));
                
                if (removeEscape) {
                    const tild = addRegexEscape(escapeMap["\\"]); //replace with tilde
                    const back = addRegexEscape(escapeMap["~"]); //replace with backslash
                    const circ = addRegexEscape(escapeMap["^"]); //replace with circumflex

                    const regex = new RegExp(`${tild}|${back}|${circ}|\\\\[&%$#_{}]`, 'g');
                    console.log(regex)
                    
                    for (let i = 0; i < matrix.length - 1; i++)
                        for (let j = 0; j < matrix[0].length - 1; j++) {
                            matrix[i][j] = matrix[i][j].replaceAll(regex, (s) => {
                                switch(s) { //replace chars with appropriate escapes
                                    case "\\&": case "\\%": case "\\$": case "\\#": case "\\_": case "\\{": case "\\}":
                                        return s.substring(1);
                                    case escapeMap["~"]:
                                        return "~";
                                    case escapeMap["^"]:
                                        return "^";
                                    case escapeMap["\\"]:
                                        return "\\";
                                    default:
                                        return s;
                                }
                            });
                    }
                }
                break;
                
                default: 
                    return;
            }
            
        dispatch(updateMatrix({"name" : name, "matrix" : matrix}));
        dispatch(updateSelection(name));
        console.log(matrix)
    }


    let inputMatrixPlaceholder = ""
    switch (importFormat) {
        case "Separator":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format, extra characters may lead to an unexpected input: \n1${settingC}0${settingC}0${settingC}0${settingD}0${settingC}1${settingC}0${settingC}0${settingD}0${settingC}0${settingC}1${settingC}0${settingD}0${settingC}0${settingC}0${settingC}1 \n`;
            break;
        case "2D Arrays":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format, extra characters may lead to an unexpected input: \n${settingA}${settingA}1${settingC}0${settingC}0${settingC}0${settingB}${settingC}\n${settingA}0${settingC}1${settingC}0${settingC}0${settingB}${settingC}\n${settingA}0${settingC}0${settingC}1${settingC}0${settingB}${settingC} \n${settingA}0${settingC}0${settingC}0${settingC}1${settingB}${settingB} \n`;
            break;
        case "Reshape From One Line":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format, extra characters may lead to an unexpected input: \n1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1 \n`;
            break;
        case "LaTeX":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format, extra characters may lead to an unexpected input: \n1 & 0 & 0 & 0 \\\\\n0 & 1 & 0 & 0 \\\\\n0 & 0 & 1 & 0 \\\\\n0 & 0 & 0 & 1\n`;
            break;
        default: break;
    }


    return <div className = {"fixed-bottom row " + styles.importContainer} style = {{"bottom": props.showFullInput ? "28px" : "0"}} ref = {textImport}>
         <textarea id = "importTextArea" className = {styles.importTextArea} placeholder = {inputMatrixPlaceholder}></textarea>

        <div className = "col-sm-4">
            <ul>
                {"Import Format"}
                <li>
                <ActiveButton
                    name = {"Separator"}
                    action = {updateImportFormat}
                    active = {importFormat === "Separator"}
                />

                <ActiveButton
                    name = {"2D Arrays"}
                    action = {updateImportFormat}
                    active = {importFormat === "2D Arrays"}
                />

                <ActiveButton
                    name = {"LaTeX"}
                    action = {updateImportFormat}
                    active = {importFormat === "LaTeX"}
                />
                <ActiveButton
                    name = {"Reshape From One Line"}
                    action = {updateImportFormat}
                    active = {importFormat === "Reshape From One Line"}
                />
            </li></ul> 
        </div>

        

        <div className = "col-sm-4">
            {importFormat === "LaTeX" ? 
            <div>
                <ParameterBoxInput isChecked = {removeEscape} name = {"Remove Escapes For: #$%&_{}^~\\"} updateParameter = {updateParameter}/>
                {removeEscape ? <div>
                    <div>Replace <ParameterTextInput text = {escapeMap["^"]} width = {"20%"} id={"^"} updateParameter={updateParameter}/> with ^</div>
                    <div>Replace <ParameterTextInput text = {escapeMap["~"]} width = {"20%"} id={"~"} updateParameter={updateParameter}/> with ~</div>
                    <div>Replace <ParameterTextInput text = {escapeMap["\\"]} width = {"20%"} id={"\\"} updateParameter={updateParameter}/> with \</div>
                </div> : null}
            </div> 
            
            : <ParameterBoxInput isChecked = {ignoreWhitespace} name = {"Ignore White Space"} updateParameter = {updateParameter}/>
            }

            {importFormat === "Separator" ? 
            <div>
                <div>Element Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></div>
                <div>Row Separator: <ParameterTextInput text = {settingD} placeholder = "\n" width = {"10%"} id={"settingD"} updateParameter={updateParameter}/></div>
            </div>
            : null }
            

            {importFormat === "2D Arrays" ? 
            <div>
                <div>Opening Bracket: <ParameterTextInput text = {settingA} width = {"10%"} id={"settingA"} updateParameter={updateParameter}/></div>
                <div>Closing Bracket: <ParameterTextInput text = {settingB} width = {"10%"} id={"settingB"} updateParameter={updateParameter}/></div>
                <div>Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></div>
            </div> : null }

            {importFormat === "Reshape From One Line" ? 
            <div>
                <div>Rows: <ParameterTextInput text = {settingA} width = {"10%"} id={"settingA"} updateParameter={updateParameter}/></div>
                <div>Columns: <ParameterTextInput text = {settingB} width = {"10%"} id={"settingB"} updateParameter={updateParameter}/></div>
                <div>Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></div>
            </div> : null }
    

            {ignoreWhitespace && displayWarning ? 
                <div className = {styles.wsWarning}>{"WARNING: One of your parameters contains whitespaces"}</div> 
            : null}

        </div>

        <div className = "col-sm-4">
            {selection ? 
                <OverwriteInput
                overwrite = {overwrite}
                updateParameter = {updateParameter}
                id = "newName"
                placeholder = {generateUniqueName(matrices)}
                newName = {newName}
            /> 
            : null}

            <button className = "btn btn-success" onClick = {parseText}>
                {"Import Matrix"}
            </button>


        </div>

        <Toggle toggle = {props.close} show = {false}/>
       
    </div>
}
export default TextImport;