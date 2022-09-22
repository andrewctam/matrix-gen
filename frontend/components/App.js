import React, { useEffect, useState, useRef } from 'react';
import MatrixEditor from './editor/MatrixEditor.js';
import Navigation from "./navigation/Navigation.js"

function App(props) {
    const [matrices, setMatrices] = useState( {
        "A": [["", ""], ["", ""]]
    });

    const [selection, setSelection] = useState("A");
    const [sparseVal, setSparseVal] = useState("0");
    
    const [mirror, setMirror] = useState(false);
    const [selectable, setSelectable] = useState(true);
    const [saveToLocal, setSaveToLocal] = useState(false);
    
    const [username, setUsername] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        loadFromLocalStorage();

        const username = localStorage.getItem("username");
        const token = localStorage.getItem("token");
        
        if (username !== null && token !== null) {
            setUsername(username);
            setToken(token);
        }
            
    }, []);

    useEffect( () => {
        if (token && username)
            updateMatrixData();
        if (saveToLocal)
            saveToLocalStorage();    
    // eslint-disable-next-line
    }, [matrices, saveToLocal]);

  
    
    function updateMatrixSelection(selected) {
        setSelection(selected);
    }

    function updateUserInfo(username, token) {
        setUsername(username);
        setToken(token);

        localStorage.setItem("username", username);
        localStorage.setItem("token", token);
    }

    function updateParameter(parameterName, updated) {
        switch (parameterName) {
            case "sparse":
                setSparseVal(updated);
                window.localStorage.setItem("sparseValue;", updated); 
                break;
            case "mirror":
                setMirror(updated);  
                window.localStorage.setItem("mirror;", updated ? "1" : "0");
                break; 
            case "selectable":
                setSelectable(updated);
                window.localStorage.setItem("selectable;", updated ? "1" : "0");
                break;
            case "saveToLocal":
                setSaveToLocal(updated);
                window.localStorage.setItem("saveToLocal;", updated ? "1" : "0");
                break;

            default: 
                console.log("Invalid?:" + parameterName);
  
        }
    
    }

    function renameMatrix(oldName, newName) {     
        const tempObj = {...matrices};
        
        if (newName in tempObj)
            return false;

        tempObj[newName] = tempObj[oldName];
        delete tempObj[oldName];

        setMatrices(tempObj);

        return true;
    }
    
    function copyMatrix(toCopy, name = undefined) {
        if (toCopy !== "0") {
            const tempObj = {...matrices};
            if (name === undefined) {
                var matrixName = generateUniqueName();
            } else {
                matrixName = name;
            }

            tempObj[matrixName] = tempObj[toCopy].map(function(arr) { return arr.slice(); });

            setMatrices(tempObj);
        }
    }

    function setMatrix(matrix = undefined, name = undefined) {
        const tempObj = {...matrices};
        if (name === undefined) {
            name = generateUniqueName();
        }
        
        if (matrix === undefined) {
            tempObj[name] = [["", ""], ["", ""]];
        } else {
            tempObj[name] = matrix;
        }
        
        setMatrices(tempObj);

        return name;
    }


    function deleteMatrix(name) {
        const tempObj = {...matrices};
        delete tempObj[name];
        setMatrices(tempObj);
    }


    function generateUniqueName() {
        const name = ["A"]; 
        var willExitFromZ = false;
        var pointer = 0;

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
            const lessRows = Math.min(rows, matrices[name].length)
            const lessCols = Math.min(cols, matrices[name][0].length)


            const resized = Array(rows).fill([])
            for (let i = 0; i < lessRows - 1; i++) {            
                const arr = Array(cols).fill("")
                for (let j = 0; j < lessCols - 1; j++) {
                    arr[j] = matrices[name][i][j]
                }

                for (let j = lessCols - 1; j < cols; j++) {
                    arr[j] = "";
                }
                
                resized[i] = arr;
            }

            
            for (let i = lessRows - 1; i < rows; i++) 
                resized[i] = Array(cols).fill("");

            if (update)
                setMatrix(resized, name); 

            return resized;
        }
    }

    /*
    function deleteMany() {
        var toDelete = window.prompt("Enter matrices to delete: (For example: \"A B C\")").split(" ");

        for (var i = 0; i < toDelete.length; i++) {
            deleteMatrix(toDelete[i]);
        }
    }
    */


    function deleteAllMatrices() {
        if (window.confirm("Delete all matrices?")) {
            setSelection("0");
            setMatrices({});

            localStorage.setItem("names;", JSON.stringify([]));
            localStorage.setItem("matrices;", JSON.stringify([]));     
        }

    }

    
    function tryToDelete(name, row, col) {
        //Can not delete the red row/column
        if (row === matrices[name].length - 1 || col === matrices[name][0].length - 1) 
            return null;
            
        const tempMatrix = [...matrices[name]];
        var toDelete = true;
        
        //{{1,1,1,1},
        // {0,0,0,0}, row
        // {1,1,1,1}}
        //Try to Delete an Empty Row
        if (matrices[name].length > 2) {
            for (let i = 0; i < matrices[name][0].length; i++) {
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
            for (let i = 0; i < matrices[name].length; i++) {
                if (matrices[name][i][col] !== "") {
                    toDelete = false;
                    break;
                }
            }

            if (toDelete) {
                for (let i = 0; i < tempMatrix.length; i++) {
                    tempMatrix[i].splice(col, 1); //delete cols
                } 
            }
        }

        setMatrix(tempMatrix, name); 
    
    }

    
    function updateEntry(name, i, j, val, tempMatrix = null) {
        if (tempMatrix === null)
            tempMatrix = [...matrices[name]]

        if (mirror) {
            //add enough rows/cols in order to update the correct  j, i

            if (i >= matrices[name][0].length - 1 && j >= matrices[name].length - 1) {
                tempMatrix = addRowsAndCols(selection, j - matrices[name].length + 2, i - matrices[name][0].length + 2, false)
            } else if (j >= matrices[name].length - 1) {
                tempMatrix = addRows(selection, j - matrices[name].length + 2, false)
            } else  if (i >= matrices[name][0].length - 1) {
                tempMatrix = addCols(selection, i - matrices[name][0].length + 2, false)
            }
            
            tempMatrix[j][i] = val;
        }

        tempMatrix[i][j] = val;
        setMatrix(tempMatrix, name); 
         
    }
    
    function addCols(name, numToAdd, update = true) {
        //copy matrix
        const tempMatrix = [...matrices[name]];


        for (let i = 0; i < tempMatrix.length; i++) {
            for (let j = 0; j < numToAdd; j++)
                //Add ""s to each row
                tempMatrix[i].push("");
        }

        if (update)
            setMatrix(tempMatrix, name); 

        return tempMatrix;
    }

    function addRows(name, numToAdd, update = true) {
        const tempMatrix = [...matrices[name]];


        for (let i = 0; i < numToAdd; i++) {
            tempMatrix.push(new Array(tempMatrix[0].length).fill(""));
        }
        
        if (update)
            setMatrix(tempMatrix, name); 

        
        return tempMatrix; 
    }

    function addRowsAndCols(name, rowsToAdd, colsToAdd, update = true) {
        const tempMatrix = [...matrices[name]];

        for (let i = 0; i < tempMatrix.length; i++) {
            for (let j = 0; j < colsToAdd; j++)
                tempMatrix[i].push("");
        }
        
        for (let i = 0; i < rowsToAdd; i++)
            tempMatrix.push(new Array(tempMatrix[0].length).fill(""));


        if (update)
            setMatrix(tempMatrix, name); 



        return tempMatrix; 
    }


    
    function mirrorRowsCols(name, mirrorRowsToCols) { 

        if (matrices[name].length > matrices[name][0].length) { //more rows than cols 
            var symmetric = addCols(name, matrices[name].length - matrices[name][0].length, false);
            
        } else if (matrices[name].length < matrices[name][0].length) {
            symmetric = addRows(name, matrices[name][0].length - matrices[name].length, false)  
        } else //rows == cols
            symmetric = [...matrices[name]];

   
        for (let row = 0; row < symmetric.length; row++) {
            for (let col = row + 1; col < symmetric.length; col++) {
                if (mirrorRowsToCols)
                    symmetric[col][row] = symmetric[row][col];
                else //mirrorColsToRows
                    symmetric[row][col] = symmetric[col][row];

            }
        }

        setMatrix(symmetric, name); 
    }
    


    function transpose(name) {
        const oldMatrix = matrices[name];
        const transposed = new Array(oldMatrix[0].length).fill([]);

        for (let i = 0; i < transposed.length; i++) {
            const arr = new Array(oldMatrix.length).fill(0);
            for (let j = 0; j < arr.length; j++)
                arr[j] = oldMatrix[j][i];
            transposed[i] = arr;       
        }

        setMatrix(transposed, name); 
    }       


    function randomMatrix(name, randomLow, randomHigh) {        
        if (randomLow <= randomHigh) {
            const tempMatrix = [...matrices[name]];
            
            for (let i = 0; i < tempMatrix.length - 1; i++)
                for (let j = 0; j < tempMatrix[0].length - 1; j++)
                    tempMatrix[i][j] = Math.floor(Math.random() * (randomHigh - randomLow)) + randomLow;
            
            setMatrix(tempMatrix, name);
        }
        else {
            alert("Invalid range")
        }
        

    }


    function reshapeMatrix(name, rowCount, colCount) {
        const currentMatrix = matrices[name];
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

        const reshaped = Array(rowCount + 1).fill().map(()=>Array(colCount + 1).fill(""))

        var reshapedI = 0;
        var reshapedJ = 0;


        for (let i = 0; i < currentMatrix.length - 1; i++)
            for (let j = 0; j < currentMatrix[0].length - 1; j++) {
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
        const tempMatrix = [...matrices[name]];
       
        for (let i = 0; i < tempMatrix.length - 1; i++)
            for (let j = 0; j < tempMatrix[0].length - 1; j++) {
                if (tempMatrix[i][j] === "")
                    tempMatrix[i][j] = fillEmptyWithThis;
            }
        
        setMatrix(tempMatrix, name);
    }

    function fillAll(name, fillAllWithThis) {
        const tempMatrix = [...matrices[name]];
       
        for (let i = 0; i < tempMatrix.length - 1; i++)
            for (let j = 0; j < tempMatrix[0].length - 1; j++) {
                tempMatrix[i][j] = fillAllWithThis;
        }
        
        setMatrix(tempMatrix, name);
    }

    function fillDiagonal(name, fillDiagonalWithThis) {
        const tempMatrix = [...matrices[name]];
       
        const smaller = Math.min(tempMatrix.length - 1,tempMatrix[0].length - 1);

        for (let i = 0; i < smaller; i++)
            tempMatrix[i][i] = fillDiagonalWithThis;
        
        
        setMatrix(tempMatrix, name);
    }

    function createIdentity(size, name = null) {
        if (name === null)
            name = generateUniqueName();

        if (size === null || isNaN(size) || size <= 0)
            return;
            
        const matrix = Array(size + 1).fill().map(()=>Array(size + 1).fill(""))

        for (let i = 0; i < size; i++)
            matrix[i][i] = 1;
        
        
        setMatrix(matrix, name);
    }
    

    function editSelection(name, text, x1, y1, x2, y2) {
        if (x1 > x2) {
            var temp = x1;
            x1 = x2;
            x2 = temp;
        }

        if (y1 > y2) {
            temp = y1;
            y1 = y2;
            y2 = temp;
        }

        const matrix = [...matrices[name]];
        console.log(x1 + " " + x2)
        console.log(y1 + " " + y2)
        for (let i = x1; i <= x2; i++)
            for (let j = y1; j <= y2; j++)
                if (text === 8)
                    matrix[i][j] = matrix[i][j].substring(0, matrix[i][j].length - 1);
                else
                    matrix[i][j] += text;

        setMatrix(matrix, name);
    }

    function spliceMatrix(name, x1, y1, x2, y2, newName = "") {
        if (newName === "")
            newName = generateUniqueName();

        if (x1 > x2) {
            var temp = x1;
            x1 = x2;
            x2 = temp;
        }

        if (y1 > y2) {
            temp = y1;
            y1 = y2;
            y2 = temp;
        }


        const spliced = Array(x2 - x1 + 2).fill().map(()=>Array(y2 - y1 + 2).fill(""))
        const matrix = matrices[name];

        for (let i = x1; i <= x2; i++)
            for (let j = y1; j <= y2; j++)
                spliced[i - x1][j - y1] = matrix[i][j];

        setMatrix(spliced, newName);
    }

    function pasteMatrix(name, splice, x1, y1, x2, y2,) {
        if (splice === "") {
            alert("Pasted matrix name is empty");
            return;
        }

        if (x1 > x2) {
            var temp = x1;
            x1 = x2;
            x2 = temp;
        }

        if (y1 > y2) {
            temp = y1;
            y1 = y2;
            y2 = temp;
        }


        const matrix = [...matrices[name]];
        const copyMatrix = matrices[splice];

        if (x2 - x1 + 2 !== copyMatrix.length || y2 - y1 + 2 !== copyMatrix[0].length) {
            alert("Error: selection dimensions and pasted matrix dimensions must match.")
            return;
        }
        
        for (let i = x1; i <= x2; i++)
            for (let j = y1; j <= y2; j++)
                matrix[i][j] = copyMatrix[i - x1][j - y1];
            

        

        setMatrix(matrix, name);
    }


    function saveToLocalStorage() {
        console.log(JSON.stringify(matrices))
        window.localStorage.setItem("matrices;", JSON.stringify(matrices))
        window.localStorage.setItem("saveToLocal;", saveToLocal ? "1" : "0")
        window.localStorage.setItem("selectable;", selectable ? "1" : "0");
        window.localStorage.setItem("sparseValue;", sparseVal)
    }


    function loadFromLocalStorage() {
        console.log("Loading from local storage...")
        try {
            const matrices = localStorage.getItem("matrices;")
            console.log(matrices)
            if (matrices === null)
                throw error;

            const parsed = JSON.parse(matrices);            
            if (parsed.length === 0) { //if {} is saved, it will be parsed to []
                setMatrices( {
                    "A": [["", ""], ["", ""]]
                });;
                setSelection("A");  
            } else {
                setMatrices(parsed);
                setSelection(Object.keys(parsed)[0]);
            }

        } catch (error) {
            console.log(error)
            console.log("Error loading.")
            setMatrices( {
                "A": [["", ""], ["", ""]]
            });;
            setSelection("A");  
        }

        setSaveToLocal(window.localStorage.getItem("saveToLocal;") === "1");
        setMirror(window.localStorage.getItem("mirror;") === "1");
        
        const sparse = window.localStorage.getItem("sparseValue;");
        if (sparse !== null)
            setSparseVal(sparse)
        else
            setSparseVal("0")

        const selectable = window.localStorage.getItem("selectable;") === "1";
        
        if (selectable !== null)
            setSelectable(selectable);
        else
            setSelectable(true);
        




    }

    useEffect(() => {
        if (token)
            getMatrixData();
    }, [token])

    const getMatrixData = async () => {
        const response = await fetch("http://localhost:8080/api/matrix", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        }).then((response) => {
            if (response.status === 401) {
                return null;
            }

            return response.json()
        })

        if (response === null) {
            console.log("Unauthorized");
            return;
        }

        setMatrices(JSON.parse(response["matrix_data"]))
        setSelection(Object.keys(JSON.parse(response["matrix_data"]))[0])
    }

    const updateMatrixData = async () => {
        const response = await fetch("http://localhost:8080/api/matrix", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                username: username,
                matrix_data: JSON.stringify(matrices)
            })
        }).then((response) => {
            if (response.status === 401) {
                return null;
            }

            return response.json()
        }).catch (error => {
            console.log(error)
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            setToken(null);
            setUsername(null);
        })

        console.log(response)
    }



    return (
        <div> 
            <Navigation 
                matrices = {matrices} 
                mirror = {mirror}
                selection = {selection}
                sparseVal = {sparseVal}
                selectable = {selectable}

                updateMatrixSelection = {updateMatrixSelection} 
                setMatrix = {setMatrix}
                deleteMatrix = {deleteMatrix}
                renameMatrix = {renameMatrix}
                copyMatrix = {copyMatrix}
                resizeMatrix = {resizeMatrix}
                updateParameter = {updateParameter}
                saveToLocalStorage = {saveToLocalStorage}
                loadFromLocalStorage = {loadFromLocalStorage}
                deleteAllMatrices = {deleteAllMatrices}

                createIdentity = {createIdentity}

                username = {username}
                updateUserInfo = {updateUserInfo}
                saveToLocal = {saveToLocal}
                setSaveToLocal = {setSaveToLocal}


                setSelection = {setSelection}
                setMatrices = {setMatrices}

                token = {token}

                
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
                fillDiagonal = {fillDiagonal}

                spliceMatrix = {spliceMatrix}
                pasteMatrix = {pasteMatrix}
                editSelection = {editSelection}
                selectable = {selectable}
            /> : null
            } 


        </div>);

}

export default App;
