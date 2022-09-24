import React, {useEffect, useState} from "react";
import ParameterBoxInput from "../../inputs/ParameterBoxInput";
import ParameterTextInput from "../../inputs/ParameterTextInput";
import ListButton from "./ListButton";

import styles from "./TextImport.module.css"

const TextImport = (props) => {
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

    useEffect(() => {
        //if one of the setting changes, update if we should display a warning
        switch(importFormat) {
            case "Separator":
                var updatedDisplayWarning = settingC.includes(" ") || settingD === "\n" || settingD.includes(" ");
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


    const updateParameter = (parameterName, updated) => {
        switch (parameterName) {
            case "Overwrite Current Matrix":
                setOverwrite(updated);
                setNewName("");
                break;
            case "settingA":
                setSettingA(updated);
                break;
            case "settingB":
                setSettingB(updated);
                break;
            case "settingC":
                setSettingC(updated);
                break;
            case "settingD":
                if (updated === "")
                    updated = "\n"
                
                setSettingD(updated);
                break;
            case "Ignore White Space":
                setIgnoreWhitespace(updated);
                break;
            case "Remove Escapes For: #$%&_{}^~\\":
                setRemoveEscape(updated);
                break;  
                

            case "^": 
            case "~": 
            case "\\": 
                    const tempObj = {...escapeMap};
                    tempObj[parameterName] = updated;
                    setEscapeMap(tempObj);
                    break;
                
            
            default: break;
        }

    }

    const updateImportFormat = (e) => {
        const updated = e.target.id;    

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

    const updateNewMatrixName = (e) => {
        const updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated)) { //only update if valid chars used
           setNewName(updated);
        }

    }

    const addRegexEscape = (str) => {
        switch(str) { //escapes for regex
            case ".": case "+": case "*": case "?": case "^": case "$": case "(": case ")": case "[": case "]": case "{": case "}": case "|":
                return "\\" + str;

            default: break;
        }

        return str.replaceAll("\\", "\\\\");

        
    }
    const parseText = () => {
        const separator = settingC;
        var text = document.getElementById("importTextArea").value;
        var matrix = [];

        if (ignoreWhitespace)
            text = text.replaceAll(/\s/g,"")
        
        if (overwrite) //overwrite current matrix
            var name = props.currentName;
        else if (newName === "") //input empty, so auto generate
            name = props.generateUniqueName();
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
                props.setMatrix(matrix, name); //override existing (or non existing) matrix
                
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
                props.setMatrix(matrix, name);

                } catch (error) {
                    console.log(error); 
                    alert("Error in input.")
                }

                break;

        
            case "Reshape From One Line":
                const elements = text.split(separator);
                var rowCount = parseInt(settingA);
                var colCount = parseInt(settingB);

                if (isNaN(rowCount) || isNaN(colCount)) { //one is empty or NaN
                    if (isNaN(rowCount) && isNaN(colCount)) {
                        alert("Enter rows and columns to reshape");
                        return;
                    } else if (!isNaN(rowCount)) { //infer cols bsed on rows
                        if (elements.length % rowCount !== 0) {
                            alert("Invalid number of rows");
                            return;
                        }
                        
                        colCount = elements.length / rowCount;
                    } else if (!isNaN(colCount)) { //infer rows based on cols
                        if (elements.length % colCount !== 0) {
                            alert("Invalid number of columns");
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

                console.log(elements)
                console.log(matrix)
                props.setMatrix(matrix, name);
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
                props.setMatrix(matrix, name); 
                break;

            default: break;
        }

        console.log(matrix)

    }


    switch (importFormat) {
        case "Separator":
            var inputMatrixPlaceholder = `Enter your matrix in this box following the format: \n1${settingC}0${settingC}0${settingC}0${settingD}0${settingC}1${settingC}0${settingC}0${settingD}0${settingC}0${settingC}1${settingC}0${settingD}0${settingC}0${settingC}0${settingC}1\nExtra characters may lead to an unexpected input`;
            break;
        case "2D Arrays":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format: \n${settingA}${settingA}1${settingC}0${settingC}0${settingC}0${settingB}${settingC}\n${settingA}0${settingC}1${settingC}0${settingC}0${settingB}${settingC}\n${settingA}0${settingC}0${settingC}1${settingC}0${settingB}${settingC}\n${settingA}0${settingC}0${settingC}0${settingC}1${settingB}${settingB}\nExtra characters may lead to an unexpected input`;
            break;
        case "Reshape From One Line":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format: \n1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1\nExtra characters may lead to an unexpected input`;
            break;
        case "LaTeX":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format: \n1 & 0 & 0 & 0 \\\\\n0 & 1 & 0 & 0 \\\\\n0 & 0 & 1 & 0 \\\\\n0 & 0 & 0 & 1\nExtra characters may lead to an unexpected input`;
            break;
        default: break;
    }


    if (!overwrite) {
        var namePlaceholder = props.generateUniqueName();
    }

    return <div className = {"row " + styles.importContainer}>
        <textarea id = "importTextArea" className = {styles.importTextArea} placeholder = {inputMatrixPlaceholder}></textarea>

        <div className = "col-sm-4">
            <ul>
                {"Import Format"}
                
                <ListButton
                    name = {"Separator"}
                    action = {updateImportFormat}
                    active = {importFormat === "Separator"}
                />

                <ListButton
                    name = {"2D Arrays"}
                    action = {updateImportFormat}
                    active = {importFormat === "2D Arrays"}
                />

                <ListButton
                    name = {"LaTeX"}
                    action = {updateImportFormat}
                    active = {importFormat === "LaTeX"}
                />
                <ListButton
                    name = {"Reshape From One Line"}
                    action = {updateImportFormat}
                    active = {importFormat === "Reshape From One Line"}
                />
            </ul> 
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
            <ParameterBoxInput isChecked = {overwrite} name = {"Overwrite Current Matrix"} updateParameter = {updateParameter}/>

            {(overwrite ? null : 
            <div>
                {"Save as New Matrix: "}
                <input className = {styles.importedMatrixName} 
                placeholder={namePlaceholder} 
                value = {newName}
                onChange={updateNewMatrixName} />
            </div>
            )}

            <button className = "btn btn-success" onClick = {parseText}>
                {"Import Matrix"}
            </button>


        </div>

       
       
    </div>
}
export default TextImport;