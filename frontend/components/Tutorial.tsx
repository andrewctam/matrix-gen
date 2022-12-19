import React, { useLayoutEffect, useState } from "react";

import styles from "./App.module.css";

interface TutorialProps {
    closeTutorial: () => void
}

interface TutorialButtonProps {
    selected: string
    name: string
    text: string
    setSelected: (str: string) => void
}


const Tutorial = (props: TutorialProps) => {
    const [selected, setSelected] = useState("editor");
    const [specificTutorial, setSpecificTutorial] = useState<JSX.Element | null>(null)

    useLayoutEffect(() => {
        var inside = null;
        switch (selected) {
            case "editor":
                inside = <div>
                    The table below can be used to modify your matrices. The white boxes represent your matrix, and the red boxes allow you to quickly expand the matrix.
                    <ul className={styles.tutorialList}>
                        <li>Typing in a white box will update the corresponding entry. </li>
                        <li>Typing in a red box will add a row/column to the matrix. They are not part of the matrix until you type in them.</li>
                        <li>You can delete the last rows/columns by clicking Backspace on the red boxes. If you want to delete a specific row/column, hold down CTRL/CMD and press Backspace on the red box on the row/column.</li>
                        <li>You can add a row/column in front of the current row/column using Enter on a red box. Simultaneously hold down CTRL/CMD to add one behind the current row/column.</li>
                        <li>Use Tab or the arrow keys to navigate the boxes. Tab will only move to white boxes (except the red box on the first row to allow you to quickly specify the number of columns, and the red boxes on the last row to allow you to expand the number of rows).</li>
                        <li>Empty boxes will be filled with a sparse value when exporting or doing math. You can edit this value in the settings.</li>
                        <li>If you want to mirror your inputs, you can enable this in the settings. Typing in box (i, j) will also edit in box (j, i).</li>
                        <li>You can create more matrices and swap between them using the Matrices menu. Click the Matrices button to open the menu, and you can drag the menu around if desired.</li>
                    </ul>
                </div>
                break;
            case "saving":
                inside = <div>
                    You can create multiple matrices and swap between them. If you need your matrices to persist after you close this webpage, you can also save them to your local browser storage or online account storage. The matrices will automatically be reloaded when this webpage is reopened.
                    <ul className={styles.tutorialList}>
                        <li>All matrices must have a name. Valid characters are uppercase and lowercase letters and underscores.</li>
                        <li>You can rename a matrix by clicking its name on the selector buttons. You can also resize it by clicking the size and entering new dimensions.</li>
                        <li>You can save matrices to your local storage and/or online to an account. Click the top bar to open the save menu.</li>
                        <li>If there is a conflict between your local and account matrix storage, (e.g. you make edits before logging in) you must choose to merge them, or to discard your local matrices. If you merge them, the matrices are combined, and duplicate names are automatically renamed.</li>
                    </ul>
                </div>
                break;
            case "actions":
                inside = <div>
                    Matrix Actions allows you to modify your matrix quickly.
                    <ul className={styles.tutorialList}>
                        <li>{"Transpose will switch the matrix's rows and columns"}</li>
                        <li>Mirroring your matrix will copy elements (i, j) over the diagonal to (j, i). Mirroring Rows will copy the elements above the diagonal onto those below the diagonal. Mirroring Columns does the opposite.</li>
                        <li>Fill Empty With will replace all empty boxes with the inputted element.</li>
                        <li>Shuffle will move the elements of the matrix to random positions</li>
                        <li>Fill All With will replace all boxes with the inputted element.</li>
                        <li>Replace X with Y will find and replace all instances of X with Y.</li>
                        <li>Fill Diagonal with replace all entires (i, i) with the inputted element.</li>
                        <li>{"Reshape Matrix will change the dimensions of the matrix and rearrange the entries similar to NumPy reshape. The matrix is resized to the inputted dimensions n x m, and the elements' positions will be rearranged based on their position in row major order (i * m + j). If the new dimensions are less than the old ones, extra elements are discarded."}</li>
                        <li>{"Resize Matrix will resize your matrix's dimentions while keeping elements at their positions. Out of bounds elements are deleted. This action is the same as the one in the selector menu."}</li>
                        <li>Scatter Numbers randomly scatter the elements in the specified range inclusive onto your matrix.</li>
                        <li>Randomize Elements will replace all entries with a random integer between the specified range inclusive.</li>
                    </ul>
                </div>
                break;
            case "math":
                inside = <div>
                    You can evaluate mathematical expressions of your matrices using Matrix Math.
                    <ul className={styles.tutorialList}>
                        <li>Enter a math expression using the name of matrices and these operators (+, -, *, ^)</li>
                        <li>You can adjust the decimal places to round to in the settings</li>
                        <li>The answer will be saved as a new matrix.</li>
                        <li>Multiplication can be scalar or matrix multiplication. For example, 2 * A would multiply each element by 2, and A * A would do matrix multiplication.</li>
                        <li>The Matrix Reductions buttons will directly reduce your matrix with the specificed algorithms.</li>
                        <li>If you matrix is square, the determinant of the matrix will be displayed</li>

                    </ul>
                </div>
                break;
            case "selection":
                inside = <div>
                    You can drag your mouse over boxes to select a sub matrix. Then, you can edit all the elements in the selection, save the selection to another matrix, or paste another matrix of the same size into the selection.
                    <ul className={styles.tutorialList}>
                        <li>Drag your mouse over boxes to select them.</li>
                        <li>Type in a box while you have a selection to edit all selected boxes. You can type characters or use backspace.</li>
                        <li>You can save the selected matrix as a new matrix. If no name is provided, a unique name is automatically generated.</li>
                        <li>You can paste another matrix into the selection by entering its name. The matrix and selection must have the same dimensions.</li>
                        <li>You can disable selection in the settings.</li>
                    </ul>
                </div>
                break;
            case "importing":
                inside = <div>
                    You can import your matrices from plain text following a specific format.
                    <ul className={styles.tutorialList}>
                        <li>When importing, you can either overwrite the current matrix or save it as a new matrix. If you save it as a new matrix, you can enter a new name or it will automatically generate one if no new name is provided.</li>
                        <li>The Separators format expects elements to be separated by a common character, and rows to be separated by a common character. By default, a space separates elements and new lines separate rows.</li>
                        <li>The 2D Array format expects elements to be formatted in brackets and separated by a common character.</li>
                        <li>Reshape From One Line takes all of the elements separated by a common character and reshapes it into the specified dimensions.</li>
                        <li>The LaTeX format follows the LaTeX matrix syntax. Do not include the environment. You can choose if you want to automatically remove escapes from these characters: {"&%$#_{}~^\\"}</li>
                        <li>The Ignore Whitespace option will remove all whitespace before parsing your input. If you use spaces or new lines for your elements or for your settings, then this will incorrectly parse the text.</li>
                    </ul>
                </div>
                break;
            case "exporting":
                inside = <div>
                    You can export your matrices to plain text for use in programming, LaTeX, etc.
                    <ul className={styles.tutorialList}>
                        <li>The output will appear in the large text box for you to copy it.</li>
                        <li>The 2D Arrays option will export the matrix in row major order. The quick options will allow you to quickly change the settings preset values.</li>
                        <li>The LaTeX option exports the matrix following LaTeX syntax. You can choose if you want to automatically add escapes for these characters: {"&%$#_{}~^\\"}</li>
                    </ul>
                </div>
                break;

            default: break;
        }
        setSpecificTutorial(<div className={styles.specificTutorial}>{inside}</div>);
    }, [selected])


    const TutorialButton = (props: TutorialButtonProps) => {
        return <button
            className={styles.tutorialButton + " btn btn-" + (props.selected === props.name ? "dark" : "light")}
            onClick={() => { props.setSelected(props.name) }}>
            {props.text}
        </button>
    }

    return <div className={styles.tutorial}>
       

        <h1>Matrix Generator</h1>
        <p className={styles.tutorialBody}>This app can help you quickly create and modify matrices.
            It features an interactive table to quickly modify your matrices, quick actions such as transpose
            to modify the entire matrix, and export options to quickly save your matrix as plain text.
            You can also import matrices from text. The app has numerous uses, such as quickly creating LaTeX matrices,
            creating random matrices of arbitrary size, doing matrix math, etc. Click the buttons below to see how to
            use the specific parts of this app:
        </p>

        <TutorialButton text="Matrix Editor" name="editor" setSelected={setSelected} selected={selected} />
        <TutorialButton text="Saving Matrices" name="saving" setSelected={setSelected} selected={selected} />
        <TutorialButton text="Matrix Actions" name="actions" setSelected={setSelected} selected={selected} />
        <TutorialButton text="Matrix Math" name="math" setSelected={setSelected} selected={selected} />
        <TutorialButton text="Selection" name="selection" setSelected={setSelected} selected={selected} />
        <TutorialButton text="Importing From Text" name="importing" setSelected={setSelected} selected={selected} />
        <TutorialButton text="Export Matrix" name="exporting" setSelected={setSelected} selected={selected} />

        {specificTutorial}

        <button
            className={"btn btn-danger " + styles.closeTutorial}
            onClick={props.closeTutorial}>
            {"Close"}
        </button>
    </div>

}


export default Tutorial;