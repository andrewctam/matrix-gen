import React, {useState} from "react";
import "./TextImport.css";
import ParameterSwitchInput from "../../inputs/ParameterSwitchInput";
import ParameterTextInput from "../../inputs/ParameterTextInput";

function TextImport(props) {
    const [overwrite, setOverwrite] = useState(true);
    const [newName, setNewName] = useState("");
    const [importFormat, setImportFormat] = useState("separator");
    const [settingA, setSettingA] = useState(""); //opening bracket, numRows
    const [settingB, setSettingB] = useState(""); //closing bracket, numCols
    const [settingC, setSettingC] = useState(" "); //separator

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
            default: break;
            
        }
    }
    function updateImportFormat(e) {
        var updated = e.target.id;    

        switch(updated) {
            case "separator":
                setSettingC(" ");
                break;
            case "2DArray":
                setSettingA("{");
                setSettingB("}");
                setSettingC(",");
                break;
            case "reshape":
                setSettingA("");
                setSettingB("");
                setSettingC(" ");
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

    function parseText() {
        var separator = settingC;
        var text = document.getElementById("importTextArea").value;
        var matrix = [];
        
        if (overwrite)
            var name = props.currentName;
        else if (newName === "")
            name = props.generateUniqueName();
        else
            name = newName;

        switch(importFormat) {
            case "separator":
                var rows = text.split("\n");
                for (var i = 0; i < rows.length; i++) {
                    matrix.push(rows[i].split(separator));
                    matrix[i].push("");
                }

                matrix.push(Array(rows[0].length).fill(""));
                props.setMatrix(matrix, name); //function will also override existing (or non existing) matrices
                
                break;
                
            case "2DArray":
                try {
                    var firstBrace = text.indexOf(settingA);
                    var lastBrace = text.lastIndexOf(settingB);
                    var noBraces = text.substring(firstBrace + 1, lastBrace);

                    rows = noBraces.split(separator + "\n");
                    for (i = 0; i < rows.length; i++) {
                        firstBrace = rows[i].indexOf(settingA);
                        lastBrace = rows[i].lastIndexOf(settingB);

                        noBraces = rows[i].substring(firstBrace + 1, lastBrace);
                        matrix.push(noBraces.split(separator));
                        matrix[i].push(" ");
                    }

                    matrix.push(Array(rows[0].length).fill(""));
                    props.setMatrix(matrix, name);

                } catch (error) {
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
                        break;
                    }
                    
                    colCount = elements.length / rowCount;
                } else if (!isNaN(colCount)) {
                    if (elements.length % colCount !== 0) {
                        alert("Invalid number of columns");
                        break;
                    }
                    
                    rowCount = elements.length / colCount;
                } else {
                    if (elements.length !== colCount * rowCount) {
                        alert("Invalid dimensions for matrix")
                        break;
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

            default: break;


                
                
        }
    }


    switch (importFormat) {
        case "separator":
            var inputMatrixPlaceholder = ` Enter your matrix in this box following the format: \n 1${settingC}0${settingC}0${settingC}0 \n 0${settingC}1${settingC}0${settingC}0 \n 0${settingC}0${settingC}1${settingC}0 \n 0${settingC}0${settingC}0${settingC}1\n Extra characters may lead to an unexpected input`;
            break;
        case "2DArray":
            inputMatrixPlaceholder = ` Enter your matrix in this box following the format: \n ${settingA}${settingA}1${settingC}0${settingC}0${settingC}0${settingB}${settingC} \n ${settingA}0${settingC}1${settingC}0${settingC}0${settingB}${settingC} \n ${settingA}0${settingC}0${settingC}1${settingC}0${settingB}${settingC} \n ${settingA}0${settingC}0${settingC}0${settingC}1${settingB}${settingB}\n Extra characters may lead to an unexpected input`;
            break;
        case "reshape":
            inputMatrixPlaceholder = ` Enter your matrix in this box following the format: \n 1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1${settingC}0${settingC}0${settingC}0${settingC}0${settingC}1\n Extra characters may lead to an unexpected input`;
            break;
        default: break;
    }

    if (!overwrite) {
        var namePlaceholder = props.generateUniqueName();
    }

    return <div className = "row importContainer">
        <textarea id = "importTextArea" className = "importBox" placeholder = {inputMatrixPlaceholder}>
            
        </textarea>

        <div className = "col-sm-3">
            <ParameterSwitchInput isChecked = {overwrite} id = "overwrite" name = "overwrite" text = {overwrite ? "Overwrite Current Matrix" : "Save as New Matrix"} updateParameter = {updateParameter}/>

            {(overwrite ? null : <div>
                {"New Matrix Name:"}
                <input className = "importedMatrixName" 
                placeholder={namePlaceholder} 
                value = {newName}
                onChange={updateNewMatrixName} />
            </div>
            )}

        </div>

        <div className = "col-sm-3">
            <ul>
                    Import Format
                    
                    <li><button id = "separator" 
                    onClick = {updateImportFormat} 
                    className = {importFormat === "separator" ? "btn btn-info" : "btn btn-secondary"}>
                    {"Separator and New Lines"}
                    </button></li>

                    <li><button id = "2DArray" 
                    onClick = {updateImportFormat} 
                    className = {importFormat === "2DArray" ? "btn btn-info" : "btn btn-secondary"}>
                    {"2D Array"}
                    </button></li>

                    <li><button id = "reshape" 
                    onClick = {updateImportFormat} 
                    className = {importFormat === "reshape" ? "btn btn-info" : "btn btn-secondary"}>
                    {"Reshape From One Line"}
                    </button></li>

                
                   
                </ul> 
        </div>

        <div className = "col-sm-3">
            {importFormat === "separator" ? 
            <p>Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></p>
            : null }
            

            {importFormat === "2DArray" ? 
            <div>
            <p>Opening Bracket: <ParameterTextInput text = {settingA} width = {"10%"} id={"settingA"} updateParameter={updateParameter}/></p>
            <p>Closing Bracket: <ParameterTextInput text = {settingB} width = {"10%"} id={"settingB"} updateParameter={updateParameter}/></p>
            <p>Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></p>
            </div> : null }

            {importFormat === "reshape" ? 
            <div>
            <p>Rows: <ParameterTextInput text = {settingA} width = {"10%"} id={"settingA"} updateParameter={updateParameter}/></p>
            <p>Columns: <ParameterTextInput text = {settingB} width = {"10%"} id={"settingB"} updateParameter={updateParameter}/></p>
            <p>Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></p>
            </div> : null }








        </div>
        <div className = "col-sm-3">
            <button className = "btn btn-success" onClick = {parseText} >Import Matrix</button>

        </div>
       
    </div>
}
export default TextImport;