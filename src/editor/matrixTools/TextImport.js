import React, {useState} from "react";
import "./TextImport.css";
import ParameterSwitchInput from "../../inputs/ParameterSwitchInput";
import ParameterTextInput from "../../inputs/ParameterTextInput";

function TextImport(props) {
    const [overwrite, setOverwrite] = useState(true);
    const [newName, setNewName] = useState("");
    const [importFormat, setImportFormat] = useState("spaces");
    const [settingA, setSettingA] = useState("");
    const [settingB, setSettingB] = useState("");
    const [settingC, setSettingC] = useState("");

    function updateParameter(i, updated) {
        switch (i) {
            case "overwrite":
                setOverwrite(updated);
                setNewName("");
                break;
            case "settingA":
                setSettingA(updated);
                break;
            
        }
    }
    function updateImportFormat(e) {
        var updated = e.target.id;    

        switch(updated) {
            case "separator":
                setSettingA(",");
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



    switch (importFormat) {
        case "spaces":
            var inputMatrixPlaceholder = ` Following this format, enter your matrix here: \n 1 0 0 0 \n 0 1 0 0 \n 0 0 1 0 \n 0 0 0 1`;
            break;
        case "separator":
            var inputMatrixPlaceholder = ` Following this format, enter your matrix here: \n 1${settingA}0${settingA}0${settingA}0 \n 0${settingA}1${settingA}0${settingA}0 \n 0${settingA}0${settingA}1${settingA}0 \n 0${settingA}0${settingA}0${settingA}1`;
            break;
        case "2DArray":
            var inputMatrixPlaceholder = ` Following this format, enter your matrix here: \n ${settingA}${settingA}1${settingC}0${settingC}0${settingC}0${settingB}${settingC} \n ${settingA}0${settingC}1${settingC}0${settingC}0${settingB}${settingC} \n ${settingA}0${settingC}0${settingC}1${settingC}0${settingB}${settingC} \n ${settingA}0${settingC}0${settingC}0${settingC}1${settingB}${settingB}`;
            break;
    }

    if (!overwrite) {
        var namePlaceholder = props.generateUniqueName();
    }

    return <div className = "row importContainer">
        <textarea className = "importBox" placeholder = {inputMatrixPlaceholder}>
            
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
            <p>Separator: <ParameterTextInput text = {settingA} width = {"10%"} id={"settingA"} updateParameter={updateParameter}/></p>
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
            <button className = "btn btn-success">Import Matrix</button>

        </div>
       
    </div>
}
export default TextImport;