import React, {useState} from 'react';
import ParameterTextInput from '../../inputs/ParameterTextInput.js';
import ParameterBoxInput from '../../inputs/ParameterBoxInput.js';
import "./MatrixExport.css";
import ListButton from './ListButton.js';

function MatrixExport(props) {    
    const [exportOption, setExportOption] = useState("2D Arrays");


    const [start, setStart] = useState("{");
    const [end, setEnd] = useState("}");
    const [delim, setDelim] = useState(",");
    const [newLines, setNewLines] = useState(true);

    const [environment, setEnvironment] = useState("bmatrix");
    const [latexEscape, setLatexEscape] = useState(true);

    const [escapeMap, setEscapeMap] = useState({
        "^":"\\char94",
        "~":"\\char126",
        "\\":"\\char92"
    })

    function handleFocus(e) {
        e.target.select();
    }
    
    function matrixToString() {
        switch (exportOption) {

        case "LaTeX":
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
                                    case "^":
                                    case "\\":
                                        return escapeMap[s];
                                        
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
        

        case "2D Arrays":
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

    function updateExportParameter(parameterName, updated) {
        switch (parameterName) { 
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

            case "^": 
            case "~": 
            case "\\": 
                var tempObj = {...escapeMap};
                tempObj[parameterName] = updated;
                setEscapeMap(tempObj);
                break;
                
                
                
            default: break;
  
        }
    }


    function updateExportOption(e) {
        var updated = e.target.id;
        switch (updated) {
            case "2D Arrays":
                setStart("{");
                setEnd("}");
                setDelim(",");
                setExportOption("2D Arrays");
                break;
            case "LaTeX":
                setEnvironment("bmatrix");
                setExportOption("LaTeX");
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

                    <ListButton
                        name = {"2D Arrays"}
                        action = {updateExportOption}
                        active = {exportOption === "2D Arrays"}
                    />

                    <ListButton
                        name = {"LaTeX"}
                        action = {updateExportOption}
                        active = {exportOption === "LaTeX"}
                    />
                </ul> 
            </div>

            <div className = "col-sm-4">
                <ParameterBoxInput isChecked = {newLines} id={"newLines"} text = {"Add New Lines"} updateParameter={updateExportParameter}/>

                {exportOption === "2D Arrays" ? <div>
                    <div>Open arrays with &nbsp;
                        <ParameterTextInput text = {start} width = {"10%"} id={"start"} updateParameter={updateExportParameter}/></div>
                    <div>End arrays with &nbsp;
                        <ParameterTextInput text = {end} width = {"10%"} id={"end"} updateParameter={updateExportParameter}/></div>
                    <div>Separate elements with &nbsp;
                        <ParameterTextInput text = {delim} width = {"10%"} id={"delim"} updateParameter={updateExportParameter}/></div>
                </div> : null}

                {exportOption === "LaTeX" ? <div>
                    <ParameterBoxInput isChecked = {latexEscape} id={"latexEscape"} text = {"Add Escapes For: #$%&_{}^~\\"} updateParameter={updateExportParameter}/>
                
                    <div>Environment &nbsp;
                    <ParameterTextInput width = {"25%"} text = {environment} id={"environment"} updateParameter={updateExportParameter}/></div>

                </div>
                : null}
            </div>

            <div className = "col-sm-4">
                {exportOption === "2D Arrays" ? 
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

                {latexEscape && exportOption === "LaTeX" ? <div>
                    <div>Replace ^ with <ParameterTextInput text = {escapeMap["^"]} width = {"20%"} id={"^"} updateParameter={updateExportParameter}/></div>
                    <div>Replace ~ with <ParameterTextInput text = {escapeMap["~"]} width = {"20%"} id={"~"} updateParameter={updateExportParameter}/></div>
                    <div>Replace \ with <ParameterTextInput text = {escapeMap["\\"]} width = {"20%"} id={"\\"} updateParameter={updateExportParameter}/></div>
                </div> : null}

            </div>
    </div>    
}



export default MatrixExport;
