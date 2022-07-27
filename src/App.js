import React, { useEffect, useState } from 'react';
import MatrixEditor from './editor/MatrixEditor.js';
import Navigation from "./navigation/Navigation.js"

function App(props) {
    const [matrices, setMatrices] = useState( {
        "A": [["", ""], ["", ""]]
    });

    const [selection, setSelection] = useState("A");
    const [sparseVal, setSparseVal] = useState("0");
    
    const [mirror, setMirror] = useState(false);
    const [autoSave, setAutoSave] = useState(false);

    
    useEffect(() => {
        loadFromLocalStorage();
    }, []);

    useEffect( () => {
        if (autoSave)
            saveToLocalStorage();    

    }, [matrices, autoSave]);

  
    
    function updateMatrixSelection(selected) {
        setSelection(selected);
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

    function setMatrix(matrix = undefined, name = undefined) {
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


    function generateUniqueName() {
        var name = ["A"]; 
        var pointer = 0;
        var willExitFromZ = false;

        while (name.join("") in matrices) {
            while (true) {
                if (pointer < 0) {
                    name.push("@"); //'A" - 1
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
    
    

    function resizeMatrix(name, rows, cols, update = true) {
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

            if (update)
                setMatrix(resized, name); 

            return resized;
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

    
    function tryToDelete(name, row, col) {
        //Can not delete the red row/column
        if (row === matrices[name].length - 1 || col === matrices[name][0].length - 1) 
            return null;
            
        var tempMatrix = [...matrices[name]];
        var toDelete = true;
        
        //{{1,1,1,1},
        // {0,0,0,0}, row
        // {1,1,1,1}}
        //Try to Delete an Empty Row
        if (matrices[name].length > 2) {
            for (var i = 0; i < matrices[name][0].length; i++) {
                if (matrices[name][row][i] !== "") {
                    toDelete = false;
                    break;
                }
            }
            if (toDelete)
                tempMatrix.splice(row, 1);
        }
    
        //     col
        //{{1,1,0,1},
        // {1,1,0,1},
        // {1,1,0,1}}
        toDelete = true;
        if (matrices[name][0].length > 2) {
            for (i = 0; i < matrices[name].length; i++) {
                if (matrices[name][i][col] !== "") {
                    toDelete = false;
                    break;
                }
            }

            if (toDelete) {
                for (i = 0; i < tempMatrix.length; i++) {
                    tempMatrix[i].splice(col, 1); //delete cols
                } 
            }
        }

        setMatrix(tempMatrix, name); 
    
    }

    
    function updateEntry(name, i, j, val, tempMatrix = null) {
        if (tempMatrix === null)
            tempMatrix = [...matrices[name]]

        if (i < 50 && j < 50) {
            if (mirror) {
                //add enough rows in order to update the correct  j, i
                if (j >= matrices[name].length - 1) {
                    tempMatrix = addRows(j - matrices[name].length + 2, false)
                }
                
                //add enough cols in order to update the correct  j, i
                if (i >= matrices[name][0].length - 1) {
                    tempMatrix = addCols(i - matrices[name][0].length + 2, false)
                }
                
                tempMatrix[j][i] = val;
            }

            tempMatrix[i][j] = val;
            setMatrix(tempMatrix, name); 
        } else
            alert("Max matrix size 50 x 50 reached!");
    }
    
    function addCols(name, numToAdd, update = true) {
        //copy matrix
        var tempMatrix = [...matrices[name]];

        //mas 50 cols
        if (tempMatrix[0].length + numToAdd > 51)
            numToAdd = 51 - tempMatrix[0].length;

        for (var i = 0; i < tempMatrix.length; i++) {
            for (var j = 0; j < numToAdd; j++)
                //Add ""s to each row
                tempMatrix[i].push("");
        }

        if (update)
            setMatrix(tempMatrix, name); 

        return tempMatrix;
    }

    function addRows(name, numToAdd, update = true) {
        var tempMatrix = [...matrices[name]];

        //max 50 rows
        if (tempMatrix.length + numToAdd > 51)
            numToAdd = 51 - tempMatrix.length;

        for (var i = 0; i < numToAdd; i++) {
            tempMatrix.push(new Array(tempMatrix[0].length).fill(""));
        }
        
        if (update)
            setMatrix(tempMatrix, name); 

        
        return tempMatrix; 
    }

    function addRowsAndCols(name, rowsToAdd, colsToAdd, update = true) {
        var tempMatrix = [...matrices[name]];

        if (tempMatrix.length + rowsToAdd > 51)
            rowsToAdd = 51 - tempMatrix.length;

        if (tempMatrix[0].length + colsToAdd > 51)
            colsToAdd = 51 - tempMatrix[0].length;

        
        for (var i = 0; i < tempMatrix.length; i++) {
            for (var j = 0; j < colsToAdd; j++)
                tempMatrix[i].push("");
        }
        
        for (i = 0; i < rowsToAdd; i++)
            tempMatrix.push(new Array(tempMatrix[0].length).fill(""));


        if (update)
            setMatrix(tempMatrix, name); 



        return tempMatrix; 
    }


    
    function mirrorRowsCols(name, mirrorRowsToCols) { 

        if (matrices[name].length > matrices[name][0].length) { //more rows than cols 
            var symmetric = addCols(matrices[name].length - matrices[name][0].length, false);
            
        } else if (matrices[name].length < matrices[name][0].length) {
            symmetric = addRows(matrices[name][0].length - matrices[name].length, false)  
        } else //rows == cols
            symmetric = [...matrices[name]];

   
        for (var row = 0; row < symmetric.length; row++) {
            for (var col = row + 1; col < symmetric.length; col++) {
                if (mirrorRowsToCols)
                    symmetric[col][row] = symmetric[row][col];
                else //mirrorColsToRows
                    symmetric[row][col] = symmetric[col][row];

            }
        }

        setMatrix(symmetric, name); 
    }


    function transpose(name) {
        var oldMatrix = matrices[name];
        var transposed = new Array(oldMatrix[0].length).fill([]);

        for (var i = 0; i < transposed.length; i++) {
            var arr = new Array(oldMatrix.length).fill(0);
            for (var j = 0; j < arr.length; j++)
                arr[j] = oldMatrix[j][i];
            transposed[i] = arr;       
        }

        setMatrix(transposed, name); 
    }       


    function randomMatrix(name, randomLow, randomHigh) {        
        if (randomLow <= randomHigh) {
            var tempMatrix = [...matrices[name]];
            
            for (var i = 0; i < tempMatrix.length - 1; i++)
                for (var j = 0; j < tempMatrix[0].length - 1; j++)
                    tempMatrix[i][j] = Math.floor(Math.random() * (randomHigh - randomLow)) + randomLow;
            
            setMatrix(tempMatrix, name);
        }
        else {
            alert("Invalid range")
        }
        

    }


    function reshapeMatrix(name, rowCount, colCount) {
        var currentMatrix = matrices[name];
        const numElements = (currentMatrix.length - 1) * (currentMatrix[0].length - 1);
      
        if (isNaN(rowCount) && isNaN(colCount)) {
            alert("Enter rows and columns to reshape. The new rows and columns must have the same product as the current rows and columns.");
        } else if (isNaN(rowCount)) {
            if (numElements % colCount !== 0) {
                alert(`Invalid number of columns. ${colCount} is not a multiple of ${numElements}`);
                return;
            } else {
                rowCount = numElements / colCount;
            }
            
            colCount = numElements / rowCount;
        } else if (isNaN(colCount)) {
            if (numElements % rowCount !== 0) {
                alert(`Invalid number of rows. ${rowCount} is not a multiple of ${numElements}`);
                return;
            } else {
                colCount = numElements / rowCount;
            }
            
            rowCount = numElements / colCount;
        } else if (numElements !== colCount * rowCount) {
            alert(`Invalid dimensions. ${rowCount} * ${colCount} is not equal to ${numElements}`);
            return;
            
        }

        var reshaped = Array(rowCount + 1).fill().map(()=>Array(colCount + 1).fill(""))

        var reshapedI = 0;
        var reshapedJ = 0;


        for (var i = 0; i < currentMatrix.length - 1; i++)
            for (var j = 0; j < currentMatrix[0].length - 1; j++) {
                reshaped[reshapedI][reshapedJ] = currentMatrix[i][j];

                if (reshapedJ >= reshaped[0].length - 2) {
                    reshapedJ = 0;
                    reshapedI++;
                } else {
                    reshapedJ++;
                }
            }

        setMatrix(reshaped, name);

    }

    function fillEmpty(name, fillEmptyWithThis) {
        var tempMatrix = [...matrices[name]];
       
        for (var i = 0; i < tempMatrix.length - 1; i++)
            for (var j = 0; j < tempMatrix[0].length - 1; j++) {
                if (tempMatrix[i][j] === "")
                    tempMatrix[i][j] = fillEmptyWithThis;
            }
        
        setMatrix(tempMatrix, name);
    }

    function fillAll(name, fillAllWithThis) {
        var tempMatrix = [...matrices[name]];
       
        for (var i = 0; i < tempMatrix.length - 1; i++)
            for (var j = 0; j < tempMatrix[0].length - 1; j++) {
                tempMatrix[i][j] = fillAllWithThis;
        }
        
        setMatrix(tempMatrix, name);
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
            <Navigation 
                matrices = {matrices} 
                autoSave = {autoSave}
                mirror = {mirror}
                selection = {selection}
                sparseVal = {sparseVal}

                updateMatrixSelection = {updateMatrixSelection} 
                setMatrix = {setMatrix}
                deleteMatrix = {deleteMatrix}
                renameMatrix = {renameMatrix}
                copyMatrix = {copyMatrix}
                resizeMatrix = {resizeMatrix}
                updateParameter = {updateParameter}
                saveToLocalStorage = {saveToLocalStorage}
                deleteAllMatrices = {deleteAllMatrices}

                
            />

            {(selection in matrices) ? 
            <MatrixEditor
                matrix = {matrices[selection]} 
                matrices = {matrices}
                name = {selection} 
                mirror = {mirror}
                sparseVal = {sparseVal}
                updateParameter = {updateParameter}
                
                setMatrix = {setMatrix}
                generateUniqueName = {generateUniqueName}

                fillEmpty = {fillEmpty}
                reshapeMatrix = {reshapeMatrix}
                randomMatrix = {randomMatrix}
                transpose = {transpose}
                mirrorRowsCols = {mirrorRowsCols}
                addRowsAndCols = {addRowsAndCols}
                addRows = {addRows}
                addCols = {addCols}
                updateEntry = {updateEntry}
                tryToDelete = {tryToDelete}
                fillAll = {fillAll}
            /> : null
            } 


        </div>);

}

export default App;
