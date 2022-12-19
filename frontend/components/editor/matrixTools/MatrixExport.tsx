import React, { useState, useRef } from 'react';
import ParameterTextInput from '../../inputs/ParameterTextInput';
import ParameterBoxInput from '../../inputs/ParameterBoxInput';
import ActiveButton from '../../buttons/ActiveButton';

import styles from "./MatrixExport.module.css"
import Toggle from '../../buttons/Toggle';
import useExpand from '../../../hooks/useExpand';
import { Settings } from '../../App';


interface MatrixExportProps {
    matrix: string[][]
    settings: Settings
    close: () => void
    showFullInput: boolean
}

const MatrixExport = (props: MatrixExportProps) => {
    const [exportOption, setExportOption] = useState("2D Arrays");

    const [start, setStart] = useState("{");
    const [end, setEnd] = useState("}");
    const [delim, setDelim] = useState(",");
    const [newLines, setNewLines] = useState(true);

    const [environment, setEnvironment] = useState("bmatrix");
    const [latexEscape, setLatexEscape] = useState(true);

    const [escapeMap, setEscapeMap] = useState({
        "^": "\\char94",
        "~": "\\char126",
        "\\": "\\char92"
    })

    const [pipeEscape, setPipeEscape] = useState(true);
    const [padMarkdown, setPadMarkdown] = useState(true);
    const [tableAlign, setTableAlign] = useState("Default")

    const matrixExport = useExpand() as React.MutableRefObject<HTMLDivElement>;

    const handleFocus = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        (e.target as HTMLTextAreaElement).select();
    }

    const matrixToString = () => {
        switch (exportOption) {
            case "LaTeX":
                var result = environment !== "" ? `\\begin{${environment}}\n` : "";

                for (let i = 0; i < props.matrix.length - 1; i++) {
                    for (let j = 0; j < props.matrix[0].length - 1; j++) {
                        let text = props.matrix[i][j];

                        if (text === "")
                            text = props.settings["Empty Element"];

                        if (latexEscape) {
                            //&%$#_{}  ~^\
                            text = text.replaceAll(/[&%$#_{}~^\\]/g, (s) => {
                                switch (s) {
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

                for (let i = 0; i < props.matrix.length - 1; i++) {
                    result += start;

                    for (let j = 0; j < props.matrix[0].length - 1; j++) {
                        if (props.matrix[i][j] !== "")
                            result += props.matrix[i][j];
                        else
                            result += props.settings["Empty Element"];

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
            case "Markdown":
                let defaultSize = 3; //default size of --- (or :---: etc)

                switch (tableAlign) {
                    case "Left":
                    case "Right":
                        defaultSize += 1;
                        break;
                    case "Center":
                        defaultSize += 2;
                        break;

                    default: break;
                }

                let size = defaultSize;

                if (padMarkdown) {
                    //find the longest element
                    for (let i = 0; i < props.matrix.length; i++) {
                        for (let j = 0; j < props.matrix[0].length; j++) {
                            let element = props.matrix[i][j];
                            switch (element) {
                                case "":
                                    if (pipeEscape && props.settings["Empty Element"] === "|")
                                        element = "&#124;"
                                    else
                                        element = props.settings["Empty Element"];
                                    break;
                                case "|":
                                    if (pipeEscape)
                                        element = "&#124;";
                                    break;
                                default:
                                    break;
                            }

                            if (element.length > size)
                                size = element.length;
                        }
                    }

                }

                //first row
                result = "|";
                for (let i = 0; i < props.matrix[0].length - 1; i++) {

                    let text = props.matrix[0][i];
                    switch (props.matrix[0][i]) {
                        case "":
                            if (pipeEscape && props.settings["Empty Element"] === "|")
                                text = "&#124;"
                            else
                                text = props.settings["Empty Element"]; break;
                        case "|":
                            if (pipeEscape)
                                text = "&#124;";
                            break;
                        default:
                            break;
                    }

                    result += ` ${text} `;

                    if (padMarkdown) {
                        for (let j = 0; j < size - text.length; j++) {
                            result += " ";
                        }
                    }

                    result += "|";
                }


                result += "\n|";

                //add |---|
                for (let i = 0; i < props.matrix[0].length - 1; i++) {
                    result += " "

                    if (tableAlign === "Left" || tableAlign === "Center")
                        result += ":"

                    result += `---`;

                    if (padMarkdown) {
                        for (let j = 0; j < size - defaultSize; j++) {
                            result += "-";
                        }
                    }

                    if (tableAlign === "Right" || tableAlign === "Center")
                        result += ":"


                    result += " |";
                }


                //last rows
                result += "\n";
                for (let i = 1; i < props.matrix.length - 1; i++) {
                    result += "|";
                    for (let j = 0; j < props.matrix[0].length - 1; j++) {

                        let text = props.matrix[i][j];
                        switch (props.matrix[i][j]) {
                            case "":
                                if (pipeEscape && props.settings["Empty Element"] === "|")
                                    text = "&#124;"
                                else
                                    text = props.settings["Empty Element"];
                                break;
                            case "|":
                                if (pipeEscape)
                                    text = "&#124;";
                                break;
                            default:
                                break;
                        }

                        result += ` ${text} `;
                        if (padMarkdown) {
                            for (let k = 0; k < size - text.length; k++) {
                                result += " ";
                            }
                        }

                        result += "|";
                    }

                    result += "\n"
                }

                return result;

            case "HTML":
                result = "<table>\n"
                for (let i = 0; i < props.matrix.length - 1; i++) {
                    result += "\t<tr>\n";

                    for (let j = 0; j < props.matrix[0].length - 1; j++) {
                        let element = props.matrix[i][j]
                        if (element === "")
                            element = props.settings["Empty Element"]

                        let tag = "td";
                        if (i === 0)
                            tag = "th";

                        result += `\t\t<${tag}>${element}</${tag}>\n`;
                    }

                    result += "\t</tr>\n";

                }

                result += "</table>"

                return result;

            default: return "";
        }

    }

    const updateExportParameter = (parameterName: string, updated: string | boolean) => {
        switch (parameterName) {
            case "start":
                if (typeof updated !== "string") return;
                setStart(updated);
                break;
            case "end":
                if (typeof updated !== "string") return;
                setEnd(updated);
                break;
            case "delim":
                if (typeof updated !== "string") return;
                setDelim(updated);
                break;
            case "Add New Lines":
                if (typeof updated !== "boolean") return;
                setNewLines(updated);
                break;
            case "environment":
                if (typeof updated !== "string") return;
                setEnvironment(updated);
                break;
            case "Escape | as &#124;":
                if (typeof updated !== "boolean") return;
                setPipeEscape(updated);
                break;
            case "Pad Entries with Spaces":
                if (typeof updated !== "boolean") return;
                setPadMarkdown(updated);
                break;


            case "Add Escapes For: #$%&_{}^~\\":
                if (typeof updated !== "boolean") return;
                setLatexEscape(updated)
                break;

            case "Left":
                setTableAlign("Left");
                break;
            case "Center":
                setTableAlign("Center");
                break;
            case "Right":
                setTableAlign("Right");
                break;
            case "Default":
                setTableAlign("Default");
                break;

            case "^":
            case "~":
            case "\\":
                if (typeof updated !== "string") return;
                const tempObj = { ...escapeMap };
                tempObj[parameterName] = updated;
                setEscapeMap(tempObj);
                break;



            default: break;

        }
    }


    const updateExportOption = (e: React.MouseEvent<HTMLButtonElement>) => {
        const updated = (e.target as HTMLButtonElement).id;
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
            case "Markdown":
                setExportOption("Markdown");
                break;
            case "HTML":
                setExportOption("HTML");
                break;

            default: break;

        }
    }

    const presets = (e: React.MouseEvent<HTMLButtonElement>) => {
        const updated = (e.target as HTMLButtonElement).id;
        switch (updated) {
            case "Square Braces [ ] ,":
                setStart("[");
                setEnd("]");
                setDelim(",");
                break;
            case "Curly Braces { } ,":
                setStart("{");
                setEnd("}");
                setDelim(",");
                break;
            case "Parentheses ( ) ,":
                setStart("(");
                setEnd(")");
                setDelim(",");
                break;

            case "Spaces":
                setStart("");
                setEnd("");
                setDelim(" ");
                break;

            default: break;
        }

    }


    return <div className={"fixed-bottom row " + styles.exportContainer} style={{ "bottom": props.showFullInput ? "28px" : "0" }} ref={matrixExport}>
        <textarea readOnly={true} onClick={handleFocus} className={styles.exportTextArea} value={matrixToString()} />

        <div className="col-sm-4">
            <ul>
                {"Export Format"}
                <li>
                    <ActiveButton
                        name={"2D Arrays"}
                        action={updateExportOption}
                        active={exportOption === "2D Arrays"}
                    />

                    <ActiveButton
                        name={"LaTeX"}
                        action={updateExportOption}
                        active={exportOption === "LaTeX"}
                    />

                    <ActiveButton
                        name={"Markdown"}
                        action={updateExportOption}
                        active={exportOption === "Markdown"}
                    />
                    <ActiveButton
                        name={"HTML"}
                        action={updateExportOption}
                        active={exportOption === "HTML"}
                    />
                </li>
            </ul>
        </div>

        <div className="col-sm-4">

            {exportOption === "2D Arrays" ? <>
                <ParameterBoxInput isChecked={newLines} name={"Add New Lines"} updateParameter={updateExportParameter} />

                <div>Open arrays with &nbsp;
                    <ParameterTextInput text={start} width={"10%"} id={"start"} updateParameter={updateExportParameter} /></div>
                <div>End arrays with &nbsp;
                    <ParameterTextInput text={end} width={"10%"} id={"end"} updateParameter={updateExportParameter} /></div>
                <div>Separate elements with &nbsp;
                    <ParameterTextInput text={delim} width={"10%"} id={"delim"} updateParameter={updateExportParameter} /></div>
            </> : null}

            {exportOption === "LaTeX" ? <>
                <ParameterBoxInput isChecked={newLines} name={"Add New Lines"} updateParameter={updateExportParameter} />
                <ParameterBoxInput isChecked={latexEscape} name={"Add Escapes For: #$%&_{}^~\\"} updateParameter={updateExportParameter} />

                <div>Environment &nbsp;
                    <ParameterTextInput width={"25%"} text={environment} id={"environment"} updateParameter={updateExportParameter} /></div>
            </>
                : null}

            {exportOption === "Markdown" ? <>
                <ParameterBoxInput isChecked={pipeEscape} name={"Escape | as &#124;"} updateParameter={updateExportParameter} />
                <ParameterBoxInput isChecked={padMarkdown} name={"Pad Entries with Spaces"} updateParameter={updateExportParameter} />
            </>
                : null}
        </div>

        <div className="col-sm-4">
            {exportOption === "2D Arrays" ?
                <ul>
                    {"Quick Options"}
                    <li>
                        <ActiveButton
                            name={"Curly Braces { } ,"}
                            action={presets}
                            active={start === "{" && end === "}" && delim === ","} />
                        <ActiveButton
                            name={"Square Braces [ ] ,"}
                            action={presets}
                            active={start === "[" && end === "]" && delim === ","} />
                        <ActiveButton
                            name={"Parentheses ( ) ,"}
                            action={presets}
                            active={start === "(" && end === ")" && delim === ","} />
                        <ActiveButton
                            name={"Spaces"}
                            action={presets}
                            active={start === "" && end === "" && delim === " "} />

                    </li>
                </ul>
                : null}

            {latexEscape && exportOption === "LaTeX" ? <div>
                <div>Replace ^ with <ParameterTextInput text={escapeMap["^"]} width={"20%"} id={"^"} updateParameter={updateExportParameter} /></div>
                <div>Replace ~ with <ParameterTextInput text={escapeMap["~"]} width={"20%"} id={"~"} updateParameter={updateExportParameter} /></div>
                <div>Replace \ with <ParameterTextInput text={escapeMap["\\"]} width={"20%"} id={"\\"} updateParameter={updateExportParameter} /></div>
            </div> : null}

            {exportOption === "Markdown" ?
                <ul>
                    {"Alignment"}
                    <li>
                        <ActiveButton
                            name={"Default"}
                            action={() => { updateExportParameter("Default", "") }}
                            active={tableAlign === "Default"} />
                        <ActiveButton
                            name={"Left"}
                            action={() => { updateExportParameter("Left", "") }}
                            active={tableAlign === "Left"} />
                        <ActiveButton
                            name={"Center"}
                            action={() => { updateExportParameter("Center", "") }}
                            active={tableAlign === "Center"} />
                        <ActiveButton
                            name={"Right"}
                            action={() => { updateExportParameter("Right", "") }}
                            active={tableAlign === "Right"} />
                    </li>
                </ul>
                : null}
        </div>

        <Toggle toggle={props.close} show={false} />

    </div>
}



export default MatrixExport;
