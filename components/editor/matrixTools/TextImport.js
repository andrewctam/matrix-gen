import React, {useEffect, useState} from "react";
import ParameterBoxInput from "../../inputs/ParameterBoxInput";
import ParameterTextInput from "../../inputs/ParameterTextInput";
import ListButton from "./ListButton";

import styles from "./TextImport.module.css"

function TextImport(props) {
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

    const [settingA, setSettingA] = useState(""); //opening bracket, numRows
    const [settingB, setSettingB] = useState(""); //closing bracket, numCols
    const [settingC, setSettingC] = useState(" "); //separator
    const [settingD, setSettingD] = useState("\n"); //new line separator
    

    useEffect(updatedDisplayWarning, [settingA, settingB, settingC, settingD, importFormat]);

    function updateParameter(parameterName, updated) {
        switch (parameterName) {
            case "overwrite":
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
            case "ignoreWhiteSpace":
                setIgnoreWhitespace(updated);
                break;
            case "removeEscape":
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

    function updatedDisplayWarning() {
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

        setDisplayWarning(updatedDisplayWarning);

    }


    function updateImportFormat(e) {
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

    function updateNewMatrixName(e) {
        const updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated)) {
           setNewName(updated);
        }

    }

    function addRegexEscape(str) {
        switch(str) { //escapes for regex
            case ".": case "+": case "*": case "?": case "^": case "$": case "(": case ")": case "[": case "]": case "{": case "}": case "|":
                return "\\" + str;

            default: break;
        }

        return str.replaceAll("\\", "\\\\");

        
    }
    function parseText() {
        const separator = settingC;
        var text = document.getElementById("importTextArea").value;
        var matrix = [];

        if (ignoreWhitespace)
            text = text.replace(/\s/g,"")

        
        if (overwrite)
            var name = props.currentName;
        else if (newName === "")
            name = props.generateUniqueName();
        else
            name = newName;

        switch(importFormat) {
            case "Separator":
                const rowSeparator = settingD;

                var rows = text.split(rowSeparator);
                for (let i = 0; i < rows.length; i++) {
                    matrix.push(rows[i].split(separator));
                    matrix[i].push("");
                }

                matrix.push(Array(rows[0].length).fill(""));
                props.setMatrix(matrix, name); //function will also override existing (or non existing) matrices
                
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
                    for (let i = 0; i < rows.length; i++) {
                        matrix.push(rows[i].split(separator));
                        matrix[i].push(" ");
                    }

                    matrix.push(Array(rows[0].length).fill(""));
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

                if (isNaN(rowCount) && isNaN(colCount)) {
                    alert("Enter rows and columns to reshape");
                } else if (!isNaN(rowCount)) {
                    if (elements.length % rowCount !== 0) {
                        alert("Invalid number of rows");
                        return;
                    }
                    
                    colCount = elements.length / rowCount;
                } else if (!isNaN(colCount)) {
                    if (elements.length % colCount !== 0) {
                        alert("Invalid number of columns");
                        return;
                    }
                    
                    rowCount = elements.length / colCount;
                } else {
                    if (elements.length !== colCount * rowCount) {
                        alert("Invalid dimensions for matrix")
                        return;
                    }
    
                }

                matrix = Array(rowCount + 1).fill().map(()=>Array(colCount + 1).fill())

                let i = 0;
                for (let j = 0; j < rowCount; j++)
                    for (let k = 0; k < colCount; k++) {
                        matrix[j][k] = elements[i];
                        i++;
                    }

                props.setMatrix(matrix, name);
                break;

            case "LaTeX":
                rows = text.split("\\\\");
                
                for (let i = 0; i < rows.length; i++) {
                    rows[i] = rows[i].replaceAll(" ","")
                    
                    matrix.push(rows[i].split("&"));
                    matrix[i].push("");
                }


                matrix.push(Array(matrix[0].length).fill(""));
                
                if (removeEscape) {

                    const tild = addRegexEscape(escapeMap["\\"]); //replace with tilde
                    const back = addRegexEscape(escapeMap["~"]); //replace with backslash
                    const circ = addRegexEscape(escapeMap["^"]); //replace with circumflex

                    const regex = new RegExp(`${tild}|${back}|${circ}|\\\\[&%$#_{}]`, 'g');
                    console.log(regex)
                    for (let i = 0; i < matrix.length - 1; i++)
                        for (let j = 0; j < matrix[0].length - 1; j++) {
                            matrix[i][j] = matrix[i][j].replaceAll(regex, (s) => {
                                switch(s) {
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
                props.setMatrix(matrix, name); //function will also override existing (or non existing) matrices
                
                break;

            default: break;
        }

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
                <ParameterBoxInput isChecked = {removeEscape} id = "removeEscape" name = "removeEscape" text = {"Remove Escapes For: #$%&_{}^~\\"} updateParameter = {updateParameter}/>
                {removeEscape ? <div>
                    <div>Replace <ParameterTextInput text = {escapeMap["^"]} width = {"20%"} id={"^"} updateParameter={updateParameter}/> with ^</div>
                    <div>Replace <ParameterTextInput text = {escapeMap["~"]} width = {"20%"} id={"~"} updateParameter={updateParameter}/> with ~</div>
                    <div>Replace <ParameterTextInput text = {escapeMap["\\"]} width = {"20%"} id={"\\"} updateParameter={updateParameter}/> with \</div>
                </div> : null}
            </div> 
            
            : <ParameterBoxInput isChecked = {ignoreWhitespace} id = "ignoreWhiteSpace" name = "ignoreWhiteSpace" text = {"Ignore White Space"} updateParameter = {updateParameter}/>
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
            <ParameterBoxInput isChecked = {overwrite} id = "overwrite" name = "overwrite" text = {"Overwrite Current Matrix"} updateParameter = {updateParameter}/>

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