import React, {useState} from 'react';
import ParameterTextInput from '../../inputs/ParameterTextInput.js';
import ParameterBoxInput from '../../inputs/ParameterBoxInput.js';
import "./MatrixExport.css";

function MatrixEditor(props) {    
    const [exportOption, setExportOption] = useState("arrays");


    const [start, setStart] = useState("{");
    const [end, setEnd] = useState("}");
    const [delim, setDelim] = useState(",");
    const [newLines, setNewLines] = useState(true);

    const [environment, setEnvironment] = useState("bmatrix");
    const [latexEscape, setLatexEscape] = useState(true);

    function handleFocus(e) {
        e.target.select();
    }
    
    function matrixToString() {
        switch (exportOption) {

        case "latex":
            var result = environment !== "" ? `\\begin{${environment}}\n` : "";
            for (var i = 0; i < props.matrix.length - 1; i++) {
                for (var j = 0; j < props.matrix[0].length - 1; j++) {
                    if (props.matrix[i][j] === "") {
                        result += props.sparseVal;        
                    } else {
                        var text = props.matrix[i][j];
                        if (latexEscape) {
                            //&%$#_{}  ~^\
                            text = text.replaceAll(/[&%$#_{}~^\\]/g, (s) => {
                                switch(s) {
                                    case "&": case "%": case "$": case "#": case "_": case "{": case "}":
                                        return "\\" + s;
                                    case "~":
                                        return "$\\sim$";
                                    case "^":
                                        return "\\textasciicircum{}";
                                    case "\\":
                                        return "\\textbackslash{}";
                                    default:
                                        return s;
                                }
                            });
                        }


                        result += text;
                    }            

                    if (j !== props.matrix[0].length - 2) {
                        result += " & ";
                    } else if (i !== props.matrix.length - 2) {
                        if (newLines)
                            result += " \\\\\n";
                        else
                        result += " \\\\ ";
                    }
                }
            }

            
            return result + (environment !== "" ? `\n\\end{${environment}}` : ""); 
        

        case "arrays":
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
                    if (newLines)
                        result += delim + "\n";
                    else
                        result += delim;

                }
            }
            return result + end;
        }

    }

    function updateExportParameter(i, updated) {
        switch (i) { 
            case "start":
                setStart(updated);  
                break;  
            case "end":
                setEnd(updated);  
                break;  
            case "delim":
                setDelim(updated);  
                break;   
            case "newLines":
                setNewLines(updated);
                break;
            case "environment":
                setEnvironment(updated);
                break;
            case "latexEscape":
                setLatexEscape(updated)
                break;
                
                
            default: break;
  
        }
    }


    function updateExportOption(e) {
        var updated = e.target.id;
        switch (updated) {
            case "arrays":
                setStart("{");
                setEnd("}");
                setDelim(",");
                setExportOption("arrays");
                break;
            case "latex":
                setEnvironment("bmatrix");
                setExportOption("latex");
                break;
            
            default: break;
  
        }
    }

    function presets(e) {
        let updated = e.target.id;
        switch(updated) {
            case "{},":
                setStart("{");
                setEnd("}");
                setDelim(",");
                break;  
            case "[],":
                setStart("[");
                setEnd("]");
                setDelim(",");
                break;
            case "(),":
                setStart("(");
                setEnd(")");
                setDelim(",");
                break;

            case "spaces":
                setStart("");
                setEnd("");
                setDelim(" ");
                break;

            default: break;
        }

    }

  
    
    return <div className = "row exportContainer">
        <textarea readOnly = {true} onClick = {handleFocus} className="exportTextArea" value = {matrixToString(props.matrix)} />

            <div className = "col-sm-4">
                <ul>
                    {"Export Format"}
                    <li><button id = "arrays"
                        onClick = {updateExportOption} 
                        className = {exportOption === "arrays" ? "btn btn-info" : "btn btn-secondary"}>
                        {"2D Arrays"}
                        </button>
                    </li>

                    <li><button id = "latex" 
                        onClick = {updateExportOption} 
                        className = {exportOption === "latex" ? "btn btn-info" : "btn btn-secondary"}>
                        {"LaTeX Format"}
                        </button>
                    </li>

                </ul> 
            </div>

            <div className = "col-sm-4">
                <ParameterBoxInput isChecked = {newLines} id={"newLines"} text = {"Add New Lines"} updateParameter={updateExportParameter}/>

                {exportOption === "arrays" ? <div>
                    <div>Open arrays with &nbsp;
                        <ParameterTextInput text = {start} width = {"10%"} id={"start"} updateParameter={updateExportParameter}/></div>
                    <div>End arrays with &nbsp;
                        <ParameterTextInput text = {end} width = {"10%"} id={"end"} updateParameter={updateExportParameter}/></div>
                    <div>Separate elements with &nbsp;
                        <ParameterTextInput text = {delim} width = {"10%"} id={"delim"} updateParameter={updateExportParameter}/></div>
                </div> : null}

                {exportOption === "latex" ? <div>
                    <ParameterBoxInput isChecked = {latexEscape} id={"latexEscape"} text = {"Add Escapes For: &%$#_{}~^\\"} updateParameter={updateExportParameter}/>

                    <div>Environment &nbsp;
                    <ParameterTextInput width = {"25%"} text = {environment} id={"environment"} updateParameter={updateExportParameter}/></div>

                </div>
                : null}
            </div>

            <div className = "col-sm-4">
                {exportOption === "arrays" ? 
                    <ul>
                        Quick Options: 
                        <li><button id = "[]," 
                            onClick = {presets} 
                            className = "btn btn-secondary">
                        {"Square Braces [ ] ,"}
                        </button></li>

                        <li><button id = "{}," 
                            onClick = {presets} 
                            className = "btn btn-secondary">
                        {"Curly Braces { } ,"}
                        </button></li>

                        <li><button id = "()," 
                            onClick = {presets} 
                            className = "btn btn-secondary">
                        {"Parentheses ( ) ,"}
                        </button></li>

                        <li><button id = "spaces" 
                            onClick = {presets} 
                            className = "btn btn-secondary">
                        {"Spaces"}
                        </button></li>

                    </ul>
                : null}

            </div>
    </div>    
}



export default MatrixEditor;
