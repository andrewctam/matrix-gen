import React, { useEffect, useState } from 'react';
import MatrixEditor from './editor/MatrixEditor.js';
import Selectors from "./selectors/Selectors.js"

function App(props) {
    const [autoSave, setAutoSave] = useState(false);
    const [mirror, setMirror] = useState(false);
    const [sparseVal, setSparseVal] = useState("0");
    const [selection, setSelection] = useState("A");
    const [matrices, setMatrices] = useState( {
        "A": [["", ""], ["", ""]]
    });

    useEffect( () => {
        if (autoSave)
            saveToLocalStorage();    

    }, [matrices, autoSave]);

    useEffect(() => {
        loadFromLocalStorage();
    }, []);


    function updateMatrix(updated, key) {
        var tempObj = {...matrices};
        tempObj[key] = updated;

        setMatrices(tempObj);
    }
    
    function updateMatrixSelection (selected) {
        setSelection(selected);

    }

    function renameMatrix(oldName, newName) {     
        var tempObj = {...matrices};
        
        if (newName in tempObj)
            return false;

        tempObj[newName] = tempObj[oldName];
        delete tempObj[oldName];

        setMatrices(tempObj);

        return true;
    }
    
    function copyMatrix(toCopy, name = undefined) {
        var tempObj = {...matrices};
        var matrixName;
        if (name === undefined) {
            matrixName = generateUniqueName();
        } else {
            matrixName = name;
        }

        tempObj[matrixName] = tempObj[toCopy].map(function(arr) { return arr.slice(); });

        setMatrices(tempObj);
    }

    function generateUniqueName() {
        var name = ["A"]; 
        var pointer = 0;
        var willExitFromZ = false;

        while (name.join("") in matrices) {
            while (true) {
                if (pointer < 0) {
                    name.push("A");
                    pointer = name.length - 1;
                    break;
                } else if (name[pointer] === "Z") {
                    name[pointer] = "A";
                    pointer--;
                    willExitFromZ = true;
                } else 
                    break;
            }

            name[pointer] = String.fromCharCode(name[pointer].charCodeAt(0) + 1);

            if (willExitFromZ) {
                pointer = name.length - 1;
                willExitFromZ = false;
            }
        }

        return name.join("");

    }
    

    


    function addMatrix(matrix = undefined, name = undefined) {
        var tempObj = {...matrices};
        var matrixName;
        if (name === undefined) {
            matrixName = generateUniqueName();
        } else {
            matrixName = name;
        }
        
        if (matrix === undefined) {
            tempObj[matrixName] = [["", ""], ["", ""]];
        } else {
            tempObj[matrixName] = matrix;
        }
        
        setMatrices(tempObj);
    }

    function deleteMatrix(del) {
        var tempObj = {...matrices};

        delete tempObj[del];
        setMatrices(tempObj);
    
    }

    function updateParameter(i, updated) {
        switch (i) {
            case "sparse":
                setSparseVal(updated);
                if (autoSave)
                    window.localStorage.setItem("sparseValue;", updated); 
                break;
            case "mirror":
                setMirror(updated);  
                if (autoSave)
                    window.localStorage.setItem("mirror;", updated ? "1" : "0");
                break; 

            case "autoSave":
                setAutoSave(updated);
                break;

            default: 
                console.log("Invalid?:" + i);
  
        }
    
    }

    function resizeMatrix(name, rows, cols) {
        if (matrices[name].length !== rows || matrices[name][0].length !== cols) {
            if (rows > 51)
                rows = 51
            if (cols > 51)
                cols = 51

            var lessRows = Math.min(rows, matrices[name].length)
            var lessCols = Math.min(cols, matrices[name][0].length)


            var resized = Array(rows).fill([])
            for (var i = 0; i < lessRows - 1; i++) {            
                var arr = Array(cols).fill("")
                for (var j = 0; j < lessCols - 1; j++) {
                    arr[j] = matrices[name][i][j]
                }

                for (j = lessCols - 1; j < cols; j++) {
                    arr[j] = "";
                }
                
                resized[i] = arr;
            }

            
            for (i = lessRows - 1; i < rows; i++) 
                resized[i] = Array(cols).fill("");


            updateMatrix(resized, name); 
        }
    }

    function deleteMany() {
        var toDelete = window.prompt("Enter matrices to delete: (For example: \"A B C\")").split(" ");

        for (var i = 0; i < toDelete.length; i++) {
            deleteMatrix(toDelete[i]);
        }
    }


    function deleteAllMatrices() {
        if (window.confirm("Delete all matrices?")) {
            setSelection("");
            setMatrices({});

            if (autoSave)
                localStorage.clear();
        }

    }

    function saveToLocalStorage() {
        var names = "";
        var matrixString = "";
        for (const [name, matrix] of Object.entries(matrices)) {
            matrixString = "";
            names += name + ",";
            
            for (var i = 0; i < matrix.length - 1; i++) {                
                for (var j = 0; j < matrix[0].length - 1; j++) {
                    matrixString += matrix[i][j];
                    if (j !== matrix[0].length - 2)
                        matrixString += ","
                }

                if (i !== matrix.length - 2)
                    matrixString += "]";
            }
                
            
            window.localStorage.setItem(name, matrixString);
        }

        window.localStorage.setItem("names;", names.substring(0, names.length - 1))
        window.localStorage.setItem("mirror;", mirror ? "1" : "0")
        window.localStorage.setItem("autoSave;", autoSave ? "1" : "0")
        window.localStorage.setItem("sparseValue;", sparseVal)
    }


    function loadFromLocalStorage() {
        try {
            var names = localStorage.getItem("names;")
            names = names.split(",")
            var loadedMatrices = {}

            var matrix;
            for (const n of names) {
                matrix = localStorage.getItem(n);
                matrix = matrix.split("]")
                for (var i = 0; i < matrix.length; i++) {
                    matrix[i] = matrix[i].split(",")
                    matrix[i].push("");
                }

                matrix.push(new Array(matrix[0].length).fill(""));


            
                loadedMatrices[n] = matrix;
            }

            setMatrices(loadedMatrices);
            setAutoSave(window.localStorage.getItem("autoSave;") === "1");
            setMirror(window.localStorage.getItem("mirror;") === "1");
            setSparseVal(window.localStorage.getItem("sparseValue;"));
            setSelection(names[0]);
        } catch (error) {
            console.log(error)
            console.log("Error loading.")
            setMatrices( {
                "A": [["", ""], ["", ""]]
            });;
            setSelection("A");
            setSparseVal("0");
            setAutoSave(false);
            setMirror(false);
        }

    }


    return (
        <div> 
            <Selectors matrices = {matrices} 
                updateMatrixSelection = {updateMatrixSelection} 
                addMatrix = {addMatrix}
                deleteMatrix = {deleteMatrix}
                renameMatrix = {renameMatrix}
                copyMatrix = {copyMatrix}
                selection = {selection}
                updateMatrix = {updateMatrix}
                resizeMatrix = {resizeMatrix}
                updateParameter = {updateParameter}
                saveToLocalStorage = {saveToLocalStorage}
                deleteAllMatrices = {deleteAllMatrices}

                autoSave = {autoSave}
                mirror = {mirror}
                sparseVal = {sparseVal}
            />

            {(selection in matrices) ? 
            <MatrixEditor
                matrix = {matrices[selection]} 
                matrices = {matrices}
                name = {selection} 
                updateMatrix = {updateMatrix}
                updateParameter = {updateParameter}
                mirror = {mirror}
                sparseVal = {sparseVal}
                addMatrix = {addMatrix}
                generateUniqueName = {generateUniqueName}
            /> : null
            } 


        </div>);

}

export default App;
