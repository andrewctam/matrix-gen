import React, {useState} from 'react';
import ParameterTextInput from '../../inputs/ParameterTextInput.js';
import ParameterBoxInput from '../../inputs/ParameterBoxInput.js';
import "./MatrixExport.css";

function MatrixEditor(props) {    
    const [start, setStart] = useState("{");
    const [end, setEnd] = useState("}");
    const [delim, setDelim] = useState(",");
    const [latex, setLatex] = useState(false);
    const [environment, setEnvironment] = useState("bmatrix");
    const [custom, setCustom] = useState(false);
    const [exportOption, setExportOption] = useState("{},");


    function handleFocus(e) {
        e.target.select();
    }
    
    function matrixToString() {
        if (latex) {
            var result = "\\begin{" + environment + "}\n";
            for (var i = 0; i < props.matrix.length - 1; i++) {
                for (var j = 0; j < props.matrix[0].length - 1; j++) {
                    if (props.matrix[i][j] === "") {
                        result += props.sparseVal;        
                    } else {
                        result += props.matrix[i][j];
                    }            

                    if (j !== props.matrix[0].length - 2) {
                        result += " & ";
                    } else if (i !== props.matrix.length - 2) {
                        result += " \\\\ \n";
                    }
                }
            }

            return result + "\n\\end{" + environment + "}"; 
        }

        result = start.toString();

        for (i = 0; i < props.matrix.length - 1; i++) {
            result += start;
            
            for (j = 0; j < props.matrix[0].length - 1; j++) {
                if (props.matrix[i][j] !== "")
                    result += props.matrix[i][j];
                else
                    result += props.sparseVal;
                    
                if (j !== props.matrix[0].length - 2) {
                    result += delim;
                }
            }
            result += end;
            if (i !== props.matrix.length - 2) {
                result += delim + "\n";
            }
        }
        return result + end;

    }

    function updateExportParameter(i, updated) {
        switch (i) {
            case "environment":
                setEnvironment(updated);  
                break;  
            case "start":
                setStart(updated);  
                break;  
            case "end":
                setEnd(updated);  
                break;  
            case "delim":
                setDelim(updated);  
                break;  
            case "latex":
                setLatex(updated);  
                break; 
            case "custom":
                setCustom(updated);  
                break; 
            default: break;
  
        }
    }


    function usePreset(e) {
        toggleCustom(false);
        var updated = e.target.id;
        switch (updated) {
            case "{},":
                setStart("{");
                setEnd("}");
                setDelim(",");
                setExportOption("{},");  
                break;  
            case "[],":
                setStart("[");
                setEnd("]");
                setDelim(",");
                setExportOption("[],");      
                break;
            case "(),":
                setStart("(");
                setEnd(")");
                setDelim(",");
                setExportOption("(),");  
            break;
            
            default: break;
  
        }
    }

    function toggleCustom(option = true) {
        updateExportParameter("custom", option);
        
        setExportOption("custom");
    }    


    
    return <div className = "row export">
        <textarea readOnly = {true} onClick = {handleFocus} className="exportOutput" value = {matrixToString(props.matrix)} />
        <div className = "col-sm-2">
            <ParameterBoxInput isChecked = {latex} id={"latex"} text = {"LaTeX Format"} updateParameter={updateExportParameter}/>
        </div>
        
        <div className = "col-sm-10">
            {latex ?
            <div>Environment &nbsp;
            <ParameterTextInput width = {"100px"} text = {"bmatrix"} id={"environment"} updateParameter={updateExportParameter}/></div>
            :

            <div className ="row">
            <div className = "col-sm-6">
                <ul>
                    Export Setting
                    <li><button id = "{}," 
                    onClick = {usePreset} 
                    className = {exportOption === "{}," ? "btn btn-info" : "btn btn-secondary"}>
                    {"Curly Braces and Comma { } ,"}
                    </button></li>

                    <li><button id = "[]," 
                    onClick = {usePreset} 
                    className = {exportOption === "[]," ? "btn btn-info" : "btn btn-secondary"}>
                    {"Square Braces and Comma [ ] ,"}
                    </button></li>

                    <li><button id = "()," 
                    onClick = {usePreset} 
                    className = {exportOption === "()," ? "btn btn-info" : "btn btn-secondary"}>
                    {"Parentheses and Comma ( ) ,"}
                    </button></li>

                    <li><button 
                    onClick = {toggleCustom} 
                    className = {exportOption === "custom" ? "btn btn-info" : "btn btn-secondary"}>
                    {"Custom"}
                    </button></li>
                </ul> 
            </div>

            {custom ?
            <div className = "col-sm-6">
                <div>Open arrays with &nbsp;
                    <ParameterTextInput text = {start} width = {"20px"} id={"start"} updateParameter={updateExportParameter}/></div>
                <div>End arrays with &nbsp;
                    <ParameterTextInput text = {end} width = {"20px"} id={"end"} updateParameter={updateExportParameter}/></div>
                <div>Separate elements with &nbsp;
                    <ParameterTextInput text = {delim} width = {"20px"} id={"delim"} updateParameter={updateExportParameter}/></div>
            </div>: null}
            
            </div>}
        </div>    
    </div>
}



export default MatrixEditor;
