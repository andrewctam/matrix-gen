import React, {useState} from "react";
import "./TextImport.css";
import ParameterSwitchInput from "../../inputs/ParameterSwitchInput";
import ParameterTextInput from "../../inputs/ParameterTextInput";

function TextImport(props) {
    const [overwrite, setOverwrite] = useState(true);
    const [newName, setNewName] = useState("");
    const [importFormat, setImportFormat] = useState("spaces");
    const [settingA, setSettingA] = useState(""); //opening bracket
    const [settingB, setSettingB] = useState(""); //closing bracket
    const [settingC, setSettingC] = useState(""); //separator

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
            
        }
    }
    function updateImportFormat(e) {
        var updated = e.target.id;    

        switch(updated) {
            case "separator":
                setSettingC(",");
                break;
            case "2DArray":
                setSettingA("{");
                setSettingB("}");
                setSettingC(",");
                break;
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
            case "spaces":
                separator = " ";
                //then follow separator using a space;
            case "separator":
                var rows = text.split("\n");
                for (var i = 0; i < rows.length; i++) {
                    matrix.push(rows[i].split(separator));
                    matrix[i].push("");
                }

                matrix.push(Array(rows[0].length).fill(""));
                

                props.addMatrix(matrix, name); //function will also override existing (or non existing) matrices
                
                break;
            
                
        }
    }


    switch (importFormat) {
        case "spaces":
            var inputMatrixPlaceholder = ` Enter your matrix in this box following the format: \n 1 0 0 0 \n 0 1 0 0 \n 0 0 1 0 \n 0 0 0 1\n Extra characters may lead to an unexpected input`;
            break;
        case "separator":
            var inputMatrixPlaceholder = ` Enter your matrix in this box following the format: \n 1${settingC}0${settingC}0${settingC}0 \n 0${settingC}1${settingC}0${settingC}0 \n 0${settingC}0${settingC}1${settingC}0 \n 0${settingC}0${settingC}0${settingC}1\n Extra characters may lead to an unexpected input`;
            break;
        case "2DArray":
            var inputMatrixPlaceholder = ` Enter your matrix in this box following the format: \n ${settingA}${settingA}1${settingC}0${settingC}0${settingC}0${settingB}${settingC} \n ${settingA}0${settingC}1${settingC}0${settingC}0${settingB}${settingC} \n ${settingA}0${settingC}0${settingC}1${settingC}0${settingB}${settingC} \n ${settingA}0${settingC}0${settingC}0${settingC}1${settingB}${settingB}\n Extra characters may lead to an unexpected input`;
            break;
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
                    <li><button id = "spaces" 
                    onClick = {updateImportFormat} 
                    className = {importFormat === "spaces" ? "btn btn-info" : "btn btn-secondary"}>
                    {"Spaces"}
                    </button></li>

                    <li><button id = "separator" 
                    onClick = {updateImportFormat} 
                    className = {importFormat === "separator" ? "btn btn-info" : "btn btn-secondary"}>
                    {"Separator"}
                    </button></li>

                    <li><button id = "2DArray" 
                    onClick = {updateImportFormat} 
                    className = {importFormat === "2DArray" ? "btn btn-info" : "btn btn-secondary"}>
                    {"2D Array"}
                    </button></li>

                
                   
                </ul> 
        </div>

        <div className = "col-sm-3">
            {importFormat === "separator" ? 
            <p>Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></p>
            : null }
            

            {importFormat === "2DArray" ? 
            <p>Opening Bracket: <ParameterTextInput text = {settingA} width = {"10%"} id={"settingA"} updateParameter={updateParameter}/></p>
            : null }
            {importFormat === "2DArray" ? 
            <p>Closing Bracket: <ParameterTextInput text = {settingB} width = {"10%"} id={"settingB"} updateParameter={updateParameter}/></p>
            : null }
            {importFormat === "2DArray" ? 
            <p>Separator: <ParameterTextInput text = {settingC} width = {"10%"} id={"settingC"} updateParameter={updateParameter}/></p>
            : null }


        </div>
        <div className = "col-sm-3">
            <button className = "btn btn-success" onClick = {parseText} >Import Matrix</button>

        </div>
       
    </div>
}
export default TextImport;