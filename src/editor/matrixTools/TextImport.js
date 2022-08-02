import React, {useEffect, useState} from "react";
import "./TextImport.css";
import ParameterBoxInput from "../../inputs/ParameterBoxInput";
import ParameterTextInput from "../../inputs/ParameterTextInput";

/*
allow large matrix entry with text input
 */
function TextImport(props) {
    const [overwrite, setOverwrite] = useState(true);
    const [displayWarning, setDisplayWarning] = useState(true);

    const [newName, setNewName] = useState("");
    const [importFormat, setImportFormat] = useState("separator");
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

    function updateParameter(i, updated) {
        switch (i) {
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
                    var tempObj = {...escapeMap};
                    tempObj[i] = updated;
                    setEscapeMap(tempObj);
                    break;
                
            
            default: break;
        }

       
            

    }

    function updatedDisplayWarning() {
        switch(importFormat) {
            case "separator":
                var updatedDisplayWarning = settingC.includes(" ") || settingD === "\n" || settingD.includes(" ");
                break;
            case "2DArrays":
                updatedDisplayWarning = settingA.includes(" ") || settingB.includes(" ") || settingC.includes(" ");
                break;
            case "reshape":
                updatedDisplayWarning = settingA.includes(" ") || settingB.includes(" ") || settingC.includes(" ");
                break;

            default: break;
        }

        setDisplayWarning(updatedDisplayWarning);

    }


    function updateImportFormat(e) {
        var updated = e.target.id;    


        switch(updated) {
            case "separator":
                setSettingC(" ");
                setSettingD("\n");
                break;
            case "2DArrays":
                setSettingA("{");
                setSettingB("}");
                setSettingC(",");

                break;
            case "reshape":
                setSettingA("1");
                setSettingB("1");
                setSettingC(" ");
                break;
            case "latex":
                break;

            default: break;
        }

        setImportFormat(updated);

    }

    function updateNewMatrixName(e) {
        var updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated)) {
           setNewName(updated);
        }

    }

    function regexEscape(str) {
        switch(str) { //escapes for regex
            case ".": case "+": case "*": case "?": case "^": case "$": case "(": case ")": case "[": case "]": case "{": case "}": case "|": case "\\":
                return "\\" + str;
            default: return str;
        }

        
    }
    function parseText() {
        var separator = settingC;
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
            case "separator":
                var rowSeparator = settingD;

                var rows = text.split(rowSeparator);
                for (var i = 0; i < rows.length; i++) {
                    matrix.push(rows[i].split(separator));
                    matrix[i].push("");
                }

                matrix.push(Array(rows[0].length).fill(""));
                props.setMatrix(matrix, name); //function will also override existing (or non existing) matrices
                
                break;
                
            case "2DArrays":
                if (!ignoreWhitespace) //if we have not already removed new lines before 
                    text = text.replaceAll("\n", "");

                try {
                    
                    var firstBrace = text.indexOf(settingA) + 1; //remove {{
                    var lastBrace = text.lastIndexOf(settingB) - 1; //remove {{
                    var noBraces = text.substring(firstBrace + 1, lastBrace);


                    //  finds },{ and removes random characters in between
                    var braceSeparator = new RegExp(`${regexEscape(settingB)}.*?${regexEscape(separator)}.*?${regexEscape(settingA)}`, 'g'); 
                    
                    rows = noBraces.split(braceSeparator);
                    for (i = 0; i < rows.length; i++) {
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
                
            
        
            case "reshape":
                var elements = text.split(separator);
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

                i = 0;
                for (var j = 0; j < rowCount; j++)
                    for (var k = 0; k < colCount; k++) {
                        matrix[j][k] = elements[i];
                        i++;
                    }

                props.setMatrix(matrix, name);
                break;

            case "latex":
                rows = text.split("\\\\");

                for (i = 0; i < rows.length; i++) {
                    rows[i] = rows[i].replace(" ","")
                    matrix.push(rows[i].split(/(?<!\\)&/));
                    matrix[i].push("");
                }


                matrix.push(Array(rows[0].length).fill(""));

                if (removeEscape) {
                    var regex = new RegExp(`(${escapeMap["\\"].replaceAll("\\", "\\\\")})|(${escapeMap["~"].replaceAll("\\", "\\\\")})|(${escapeMap["^"].replaceAll("\\", "\\\\")})|(\\\\[&%$#_{}])`, 'g');
                    console.log(regex)
                    for (i = 0; i < matrix.length - 1; i++)
                        for (j = 0; j < matrix[0].length - 1; j++) {
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
        case "separator":
            var inputMatrixPlaceholder = `Enter your matrix in this box following the format: \n1${settingC}0${settingC}0${settingC}0${settingD}0${settingC}1${settingC}0${settingC}0${settingD}0${settingC}0${settingC}1${settingC}0${settingD}0${settingC}0${settingC}0${settingC}1\nExtra characters may lead to an unexpected input`;
            break;
        case "2DArrays":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format: \n${settingA}${settingA}1${settingC}0${settingC}0${settingC}0${settingB}${settingC}\n${settingA}0${settingC}1${settingC}0${settingC}0${settingB}${settingC}\n${settingA}0${settingC}0${settingC}1${settingC}0${settingB}${settingC}\n${settingA}0${settingC}0${settingC}0${settingC}1${settingB}${settingB}\nExtra characters may lead to an unexpected input`;
            break;
        case "reshape":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format: \n1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1\nExtra characters may lead to an unexpected input`;
            break;
        case "latex":
            inputMatrixPlaceholder = `Enter your matrix in this box following the format: \n1 & 0 & 0 & 0 \\\\\n0 & 1 & 0 & 0 \\\\\n0 & 0 & 1 & 0 \\\\\n0 & 0 & 0 & 1\nExtra characters may lead to an unexpected input`;
            break;
        default: break;
    }


    if (!overwrite) {
        var namePlaceholder = props.generateUniqueName();
    }

    return <div className = "row importContainer">
        <textarea id = "importTextArea" className = "importBox" placeholder = {inputMatrixPlaceholder}></textarea>

        <div className = "col-sm-4">
            <ul>
                {"Import Format"}
                
                <li><button id = "separator" 
                onClick = {updateImportFormat} 
                className = {importFormat === "separator" ? "btn btn-info" : "btn btn-secondary"}>
                {"Separators"}
                </button></li>

                <li><button id = "2DArrays" 
                onClick = {updateImportFormat} 
                className = {importFormat === "2DArrays" ? "btn btn-info" : "btn btn-secondary"}>
                {"2D Arrays"}
                </button></li>

                <li><button id = "latex" 
                onClick = {updateImportFormat} 
                className = {importFormat === "latex" ? "btn btn-info" : "btn btn-secondary"}>
                {"LaTeX Format"}
                </button></li>
                   

                <li><button id = "reshape" 
                onClick = {updateImportFormat} 
                className = {importFormat === "reshape" ? "btn btn-info" : "btn btn-secondary"}>
                {"Reshape From One Line"}
                </button></li>

                
                </ul> 
        </div>

        <div className = "col-sm-4">
            {importFormat === "latex" ? 
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

            {importFormat === "separator" ? 
            <div>
                <div>Element Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></div>
                <div>Row Separator: <ParameterTextInput text = {settingD} placeholder = "\n" width = {"10%"} id={"settingD"} updateParameter={updateParameter}/></div>
            </div>
            : null }
            

            {importFormat === "2DArrays" ? 
            <div>
                <div>Opening Bracket: <ParameterTextInput text = {settingA} width = {"10%"} id={"settingA"} updateParameter={updateParameter}/></div>
                <div>Closing Bracket: <ParameterTextInput text = {settingB} width = {"10%"} id={"settingB"} updateParameter={updateParameter}/></div>
                <div>Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></div>
            </div> : null }

            {importFormat === "reshape" ? 
            <div>
                <div>Rows: <ParameterTextInput text = {settingA} width = {"10%"} id={"settingA"} updateParameter={updateParameter}/></div>
                <div>Columns: <ParameterTextInput text = {settingB} width = {"10%"} id={"settingB"} updateParameter={updateParameter}/></div>
                <div>Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></div>
            </div> : null }
    

            {ignoreWhitespace && displayWarning ? <div class = "wsWarning">{"WARNING: One of your parameters contains whitespaces"}</div> : null}

        </div>

        <div className = "col-sm-4">
            <ParameterBoxInput isChecked = {overwrite} id = "overwrite" name = "overwrite" text = {"Overwrite Current Matrix"} updateParameter = {updateParameter}/>

            {(overwrite ? null : <div>
                {"Save as New Matrix: "}
                <input className = "importedMatrixName" 
                placeholder={namePlaceholder} 
                value = {newName}
                onChange={updateNewMatrixName} />
            </div>
            )}

        <button className = "btn btn-success" onClick = {parseText} >Import Matrix</button>


        </div>

       
       
    </div>
}
export default TextImport;