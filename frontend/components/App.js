import React, { useEffect, useState, useRef } from 'react';
import MatrixEditor from './editor/MatrixEditor.js';
import Navigation from "./navigation/Navigation.js"

const App = (props) => {
    const [matrices, setMatrices] = useState(null);

    const [selection, setSelection] = useState("0");
    const [sparseVal, setSparseVal] = useState("0");
    
    const [mirror, setMirror] = useState(false);
    const [selectable, setSelectable] = useState(true);
    const [saveToLocal, setSaveToLocal] = useState(false);
    
    const [username, setUsername] = useState(null);
    
    
    const [showMerge, setShowMerge] = useState(null);
    const [userMatrices, setUserMatrices] = useState(null);

    const saving = useRef(false);
    const [dataTooLarge, setDataTooLarge] = useState(false);

    //load from local storage and set up app
    useEffect(() => {
        window.addEventListener("beforeunload", (e) => {
            if (saving.current)
                e.returnValue = ""
        }); 
        

        const username = localStorage.getItem("username");
        
        if (username !== null) {
            setUsername(username);
        } else if (localStorage.getItem("matrices;") !== null) {
            loadFromLocalStorage();
            updateParameter("showMerge", false);
        } else {
            setMatrices( {
                "A": [["", ""], ["", ""]]
            });;
            setSelection("A");
            updateParameter("showMerge", false);
        }

        setSaveToLocal(window.localStorage.getItem("saveToLocal;") === "1");
        setMirror(window.localStorage.getItem("mirror;") === "1");

        const sparse = window.localStorage.getItem("sparseValue;");
        if (sparse !== null)
            setSparseVal(sparse)
        else
            setSparseVal("0")

        const selectable = window.localStorage.getItem("selectable;");
        
        if (selectable === null)
            setSelectable(true);
        else
            setSelectable(selectable === "1");

        
    }, []);

    //send updates to server
    useEffect( () => {
        if (!showMerge && username)
            updateAccountMatrices();
       
    // eslint-disable-next-line
    }, [matrices]);

    //if a new user is logged in, get their matrices
    useEffect(() => {
        if (username)
            getMatrixData();
        
    }, [username])

    //save matrices to local storage
    useEffect(() => {
        if (matrices && saveToLocal)
            saveToLocalStorage();    
    }, [[matrices, saveToLocal]] )
    

   
    //used for updating state and local storage
    const updateParameter = (parameterName, updated) => {
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
                if (!updated)
                    localStorage.removeItem("matrices;");

                break;
                
            case "showMerge":
                setShowMerge(updated);
                window.localStorage.setItem("showMerge;", updated ? "1" : "0");
                break;

            default: 
                console.log("Invalid?:" + parameterName);
  
        }
    
    }

    //functions related to matrix editing
    const renameMatrix = (oldName, newName) => {     
        const tempObj = {...matrices};
        
        if (newName in tempObj)
            return false;

        //rename and delete old one
        tempObj[newName] = tempObj[oldName]; 
        delete tempObj[oldName];

        setMatrices(tempObj);

        return true;
    }
    
    const setMatrix = (matrix = undefined, name = undefined) => {
        const tempObj = {...matrices};
        if (name === undefined) { //no name, generate one
            name = generateUniqueName();
        }
        
        if (matrix === undefined) { //no matrix, generate 1 x 1 one
            tempObj[name] = [["", ""], ["", ""]];
        } else {
            tempObj[name] = matrix;
        }
        
        setMatrices(tempObj);
        return name; //return name of matrix (mainly for input is undefined)
    }

    const copyMatrix = (toCopy, name = undefined) => {
        if (toCopy !== "0") {
            const tempObj = {...matrices};

            if (name === undefined) { //no name, generate one
                var matrixName = generateUniqueName();
            } else {
                matrixName = name;
            }

            //deep copy matrix
            tempObj[matrixName] = JSON.parse(JSON.stringify(matrices[toCopy]));

            setMatrices(tempObj);
        }
    }

    const deleteMatrix = (name) => {
        const tempObj = {...matrices};
        delete tempObj[name];
        setMatrices(tempObj);
    }

    const deleteAllMatrices = () => {
        if (window.confirm("Are you sure you want to delete all of your matrices?")) {
            setSelection("0");
            setMatrices({});

            localStorage.removeItem("matrices;");     
        }

    }

    const generateUniqueName = () => {
        const name = ["A"]; 
        var willExitFromZ = false;
        var pointer = 0;

        //go from back to front and increment the letter. 
        //if we reach Z, we set it to A and increment the previous letter
        //if we reach the start of the string, pointer == -1, we just had a 
        //Z...Z that converted to A...A, so we add a new letter to start at A...AA
        while (name.join("") in matrices) { //go until name is unique
            while (true) {
            
                if (pointer < 0) { //reached start of string
                    name.push("@"); //'A' - 1, will be incremeneted to 'A' after loop breaks
                    pointer = name.length - 1; //go to end of string
                    break;
                } else if (name[pointer] === "Z") { //found a Z. we can't increment it so set to A and go backwards.
                    name[pointer] = "A";
                    pointer--;
                    willExitFromZ = true;
                } else  //not a Z and not -1, so we can increment it
                    break;
            }

            //increment the char at pointer
            name[pointer] = String.fromCharCode(name[pointer].charCodeAt(0) + 1);

            if (willExitFromZ) { //if we exited from a Z, go to end of string and start going backwards again
                pointer = name.length - 1;
                willExitFromZ = false;
            }
        }

        return name.join("");

    }

    const resizeMatrix = (name, rows, cols, update = true) => {
        if (matrices[name].length !== rows || matrices[name][0].length !== cols) { //check to make new and old dimensions are different
            //get the smaller of each dimension in case new > old
            const lessRows = Math.min(rows, matrices[name].length)
            const lessCols = Math.min(cols, matrices[name][0].length)


            const resized = Array(rows).fill([])
            for (let i = 0; i < lessRows - 1; i++) { //fill in the rows up to the smaller of the two
                const arr = Array(cols).fill("") 

                for (let j = 0; j < lessCols - 1; j++) { //fill in the columns up to the smaller of the two
                    arr[j] = matrices[name][i][j]
                }

                for (let j = lessCols - 1; j < cols; j++) { //fill in the rest of the columns with empty strings
                    arr[j] = "";
                }
                
                resized[i] = arr;
            }

            //fill in rest of row with empty strings
            for (let i = lessRows - 1; i < rows; i++) 
                resized[i] = Array(cols).fill("");

            if (update) //if we want to update the state
                setMatrix(resized, name); 

            return resized;
        }
    }

    const tryToDelete = (name, row, col) => {
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
    
    const updateEntry = (name, i, j, val, tempMatrix = null) => {
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
    
    const addCols = (name, numToAdd, update = true) => {
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

    const addRows = (name, numToAdd, update = true) => {
        const tempMatrix = [...matrices[name]];


        for (let i = 0; i < numToAdd; i++) {
            tempMatrix.push(new Array(tempMatrix[0].length).fill(""));
        }
        
        if (update)
            setMatrix(tempMatrix, name); 

        
        return tempMatrix; 
    }

    const addRowsAndCols = (name, rowsToAdd, colsToAdd, update = true) => {
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
    
    //functions related to matrix actions
    const mirrorRowsCols = (name, mirrorRowsToCols) => { 

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
    
    const transpose = (name) => {
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

    const randomMatrix = (name, randomLow, randomHigh) => {        
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

    const reshapeMatrix = (name, rowCount, colCount) => {
        const currentMatrix = matrices[name];      
        
        const numElements = (currentMatrix.length - 1) * (currentMatrix[0].length - 1);
        if (isNaN(rowCount) || isNaN(colCount)) { //one is empty or NaN
            if (isNaN(rowCount) && isNaN(colCount)) {
                alert("Enter rows and columns to reshape");
                return;
            } else if (!isNaN(rowCount)) { //infer cols bsed on rows
                if (numElements % rowCount !== 0) {
                    alert("Invalid number of rows");
                    return;
                }
                
                colCount = numElements / rowCount;
            } else if (!isNaN(colCount)) { //infer rows based on cols
                if (numElements % colCount !== 0) {
                    alert("Invalid number of columns");
                    return;
                }
                
                rowCount = numElements / colCount;
            } 
        }


        const reshaped = Array(rowCount + 1).fill([]).map(()=>Array(colCount + 1).fill(""))

        //pointers for reshaped matrix
        var reshapedI = 0;
        var reshapedJ = 0;


        //iterate through matrix and copy to reshaped
        for (let i = 0; i < currentMatrix.length - 1; i++) {
            for (let j = 0; j < currentMatrix[0].length - 1; j++) {
                if (reshapedJ >= colCount) { //last col
                    reshapedJ = 0; //wrap back to first col
                    reshapedI++;
                }
                
                if (reshapedI >= rowCount)
                    break; //reached end of reshaped matrix

                reshaped[reshapedI][reshapedJ] = currentMatrix[i][j]; 

                reshapedJ++;
            }
            if (reshapedI >= rowCount)
                break;
        }

        setMatrix(reshaped, name);

    }

    const fillEmpty = (name, fillEmptyWithThis) => {
        const tempMatrix = [...matrices[name]];
       
        for (let i = 0; i < tempMatrix.length - 1; i++)
            for (let j = 0; j < tempMatrix[0].length - 1; j++) {
                if (tempMatrix[i][j] === "")
                    tempMatrix[i][j] = fillEmptyWithThis;
            }
        
        setMatrix(tempMatrix, name);
    }

    const fillAll = (name, fillAllWithThis) => {
        const tempMatrix = [...matrices[name]];
       
        for (let i = 0; i < tempMatrix.length - 1; i++)
            for (let j = 0; j < tempMatrix[0].length - 1; j++) {
                tempMatrix[i][j] = fillAllWithThis;
        }
        
        setMatrix(tempMatrix, name);
    }

    const fillDiagonal = (name, fillDiagonalWithThis) => {
        const tempMatrix = [...matrices[name]];
       
        const smaller = Math.min(tempMatrix.length - 1,tempMatrix[0].length - 1);

        for (let i = 0; i < smaller; i++)
            tempMatrix[i][i] = fillDiagonalWithThis;
        
        
        setMatrix(tempMatrix, name);
    }

    const createIdentity = (size, name = null) => {
        if (name === null)
            name = generateUniqueName();

        if (size === null || isNaN(size) || size <= 0)
            return;
            
        const matrix = Array(size + 1).fill().map(()=>Array(size + 1).fill(""))

        for (let i = 0; i < size; i++)
            matrix[i][i] = 1;
        
        
        setMatrix(matrix, name);
    }
    
    //functions related to matrix selection
    const editSelection = (name, text, x1, y1, x2, y2) => {
        if (x1 > x2) { //x1 to smaller
            var temp = x1;
            x1 = x2;
            x2 = temp;
        }

        if (y1 > y2) { //y1 to smaller
            temp = y1;
            y1 = y2;
            y2 = temp;
        }

        const matrix = [...matrices[name]];

        for (let i = x1; i <= x2; i++)
            for (let j = y1; j <= y2; j++)
                if (text === 8) //backspace
                    matrix[i][j] = matrix[i][j].substring(0, matrix[i][j].length - 1); //remove last char
                else
                    matrix[i][j] += text;

        setMatrix(matrix, name);
    }

    const spliceMatrix = (name, x1, y1, x2, y2, newName = "") => {
        if (newName === "")
            newName = generateUniqueName(); //if no name is provided, generate a unique one

        if (x1 > x2) { //x1 to smaller
            var temp = x1;
            x1 = x2;
            x2 = temp;
        }

        if (y1 > y2) { //y1 to smaller
            temp = y1;
            y1 = y2;
            y2 = temp;
        }


        const spliced = Array(x2 - x1 + 2).fill().map(()=>Array(y2 - y1 + 2).fill("")) //new matrix of appropriate size
        const matrix = matrices[name];

        for (let i = x1; i <= x2; i++) //deep copy
            for (let j = y1; j <= y2; j++)
                spliced[i - x1][j - y1] = matrix[i][j];

        setMatrix(spliced, newName);
    }

    const pasteMatrix = (name, splice, x1, y1, x2, y2,) => {
        if (splice === "") {
            alert("Pasted matrix name is empty");
            return;
        }

        if (x1 > x2) { //x1 to smaller
            var temp = x1;
            x1 = x2;
            x2 = temp;
        }

        if (y1 > y2) { //y1 to smaller
            temp = y1;
            y1 = y2;
            y2 = temp;
        }


        const copyMatrix = matrices[splice];
        const matrix = [...matrices[name]]; 

        if (x2 - x1 + 2 !== copyMatrix.length || y2 - y1 + 2 !== copyMatrix[0].length) {
            alert("Error: selection dimensions and pasted matrix dimensions must match.")
            return;
        }
        
        for (let i = x1; i <= x2; i++) //paste into matrix
            for (let j = y1; j <= y2; j++)
                matrix[i][j] = copyMatrix[i - x1][j - y1];
            

        setMatrix(matrix, name);
    }

    //functions related to saving
    const saveToLocalStorage = () => {
        saving.current = true
        console.log(JSON.stringify(matrices))
        window.localStorage.setItem("matrices;", JSON.stringify(matrices))
        window.localStorage.setItem("saveToLocal;", saveToLocal ? "1" : "0")
        window.localStorage.setItem("selectable;", selectable ? "1" : "0");
        window.localStorage.setItem("sparseValue;", sparseVal)
        saving.current = false
    }


    const loadFromLocalStorage = () => {
        console.log("Loading from local storage...")
        try {
            const matrices = localStorage.getItem("matrices;")
            console.log(matrices)
            if (matrices === null)
                throw new Error("No matrices found in local storage");

            const parsed = JSON.parse(matrices);            
            if (parsed.length === 0) { //if {} is saved, it will be parsed to []
                throw new Error("No matrices found in local storage");
            } else {
                setMatrices(parsed);
                setSelection(Object.keys(parsed)[0]);
            }

        } catch (error) {
            console.log(error)
            console.log("Error loading.")
            localStorage.removeItem("matrices;");

            setMatrices( {
                "A": [["", ""], ["", ""]]
            });;
            setSelection("A");  
        }

    }

    const updateUserInfo = (username, access_token, refresh_token) => {
        setUsername(username);

        if (username)
            localStorage.setItem("username", username);
        else 
            localStorage.removeItem("username");
        
        if (access_token && refresh_token) {
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
        } else {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        }

        if (!username && !access_token && !refresh_token) {
           loadFromLocalStorage();
        }

    }

    const getMatrixData = async () => {        
        const response = await fetch("https://matrixgen.fly.dev/api/matrix", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " +  localStorage.getItem("access_token")
            }
        }).then((response) => {
            if (response.status === 401) { //invalid access token
                return null;
            }

            return response.json()
        })

        if (response === null) {
            if (await refreshTokens()) { 
                return getMatrixData(); //retry
            } else { //refresh token invalid
                console.log("Unauthorized"); 
                updateUserInfo(null, null, null);

                if (matrices === null)
                    loadFromLocalStorage();

                return;
            }
        }

        
        const userMatrices = JSON.parse(response["matrix_data"]); //matrices saved in database
        var localMatricesStr = localStorage.getItem("matrices;"); 

        if (localMatricesStr === null) { //saving to local storage is disabled so no matrices were found
            if (matrices === null) //page is loading, so its null
                localMatricesStr = null;
            else
                localMatricesStr = JSON.stringify(matrices); //use matrices in memory
        }

        //if the local matries are default, trivial, or the same as the user's matrices, merging is unnecessary
        const mergeUnnecessary = (localMatricesStr === null ||
                                localMatricesStr === "{}" ||
                                localMatricesStr === JSON.stringify({"A": [["", ""], ["", ""]]}) ||
                                localMatricesStr === response["matrix_data"])
        
        if (mergeUnnecessary)  { 
            updateParameter("showMerge", false);
            setMatrices(userMatrices)
            if (Object.keys(userMatrices).length > 0)
                setSelection(Object.keys(userMatrices)[0])
            else
                setSelection("0");
           
        } else {
            updateParameter("showMerge", true);
            setUserMatrices(userMatrices);
            
            if (!matrices || saveToLocal) //if the page is loading, load from local storage if enabled.
                loadFromLocalStorage();
            //otherwise, the merge request was made after the page finished laoding, so don't re load from local storage

           
        }
    }

    const updateAccountMatrices = async () => {
        saving.current = true
        const response = await fetch("https://matrixgen.fly.dev/api/matrix", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access_token")
            },
            body: JSON.stringify({
                username: username,
                matrix_data: JSON.stringify(matrices)
            })
        }).then((response) => {
           if (response.status === 413) { //data too large
               if (!dataTooLarge) { //only show the alert the first time
                   alert("WARNING: Matrix data is too large to be saved online. Please delete some matrices or save to local storage, or your changes may be lost.");
                }
                setDataTooLarge(true)
                return response.json();
            }

            setDataTooLarge(false);
            if (response.status === 401) {
                return null; //invalid access token
            } else {
                console.log("Matrices saved to account")
                return response.json()
            }

        }).catch (error => {
            console.log(error)
        })

        if (response === null) { 
            if (await refreshTokens()) { 
                return updateAccountMatrices(); //retry
            } else { //refresh token invalid
                console.log("Unauthorized");
                updateUserInfo(null, null, null);
                return;
            }
        }

        saving.current = false
    }

    const refreshTokens = async () => {
        const response = await fetch("https://matrixgen.fly.dev/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("refresh_token")
            }
        }).then((response) => {
            if (response.status === 401) { //invalid access token
                return null;
            }

            return response.json()
        }).catch (error => {
            console.log(error)
        })

        if (response) {
            console.log("Tokens refreshed")
            localStorage.setItem("access_token", response["access_token"]);
            localStorage.setItem("refresh_token", response["refresh_token"]);

            return true;
        } else {
            updateUserInfo(null, null, null);
            localStorage.removeItem("refresh_token");
            return false;
        }
    }
   
    if (matrices)
        return (
        <div> 
            <Navigation 
                matrices = {matrices} 
                mirror = {mirror}
                selection = {selection}
                sparseVal = {sparseVal}
                selectable = {selectable}

                setMatrix = {setMatrix}
                deleteMatrix = {deleteMatrix}
                renameMatrix = {renameMatrix}
                copyMatrix = {copyMatrix}
                resizeMatrix = {resizeMatrix}
                updateParameter = {updateParameter}
                saveToLocalStorage = {saveToLocalStorage}
                deleteAllMatrices = {deleteAllMatrices}

                createIdentity = {createIdentity}

                username = {username}
                updateUserInfo = {updateUserInfo}
                refreshTokens = {refreshTokens}
                saveToLocal = {saveToLocal}
                setSaveToLocal = {setSaveToLocal}


                setSelection = {setSelection}
                setMatrices = {setMatrices}


                showMerge = {showMerge}
                setShowMerge = {setShowMerge}
                userMatrices = {userMatrices}
                
                dataTooLarge = {dataTooLarge}
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
    else
        return <div />

}

export default App;
