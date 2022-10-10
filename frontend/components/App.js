import React, { useEffect, useState, useRef } from 'react';
import MatrixEditor from './editor/MatrixEditor.js';
import Navigation from "./navigation/Navigation.js"
import matrixEditorStyles from './editor/MatrixEditor.module.css';

import ActiveButton from './editor/ActiveButton.js';
import BasicActionButton from './editor/matrixTools/BasicActionButton.js';
import TextImport from './editor/matrixTools/TextImport.js';

import { generateUniqueName } from './matrixFunctions.js';

const App = (props) => {
    const [matrices, setMatrices] = useState(null);
    const [selection, setSelection] = useState("0"); //0 for no selection
    
    const [mirror, setMirror] = useState(false);
    const [selectable, setSelectable] = useState(true);
    const [numbersOnly, setNumbersOnly] = useState(false);
    const [sparseVal, setSparseVal] = useState("0"); 
    
    const [username, setUsername] = useState(null);
    const [saveToLocal, setSaveToLocal] = useState(false);
    
    const [showMerge, setShowMerge] = useState(null);
    const [userMatrices, setUserMatrices] = useState(null);

    const saving = useRef(false);
    const [dataTooLarge, setDataTooLarge] = useState(false);

    const [firstVisit, setFirstVisit] = useState(false);

    const [showImport, setShowImport] = useState(false);

    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const optionsBarRef = useRef(null);

    //load from local storage and set up app
    useEffect(() => {
        window.addEventListener("beforeunload", (e) => {
            if (saving.current)
                e.returnValue = "";
        }); 
        
        const username = localStorage.getItem("username");
        
        if (username !== null) {
            setUsername(username);
        } else if (localStorage.getItem("matrices") !== null) {
            loadFromLocalStorage();
            updateParameter("Show Merge", false);
        } else {
            setMatrices( {
                "A": [["", ""], ["", ""]]
            });
            setSelection("A");
            updateParameter("Show Merge", false);
        }

        setSaveToLocal(window.localStorage.getItem("Save To Local") === "1");
        setMirror(window.localStorage.getItem("Mirror Inputs") === "1");
        setNumbersOnly(window.localStorage.getItem("Numbers Only Input") === "1");

        const sparse = window.localStorage.getItem("Empty Element");
        if (sparse !== null)
            setSparseVal(sparse)
        else
            setSparseVal("0")

        const disableSelection = window.localStorage.getItem("Disable Selection");

        if (disableSelection === null)
            setSelectable(true);
        else
            setSelectable(disableSelection === "0");

        if (window.localStorage.getItem("First Visit") === null) {
            setFirstVisit(true);
            window.localStorage.setItem("First Visit", "0");
        }

        

    // eslint-disable-next-line
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
      
    // eslint-disable-next-line
    }, [username])

    //save matrices to local storage
    useEffect(() => {
        if (matrices && saveToLocal)
            saveToLocalStorage();   
    // eslint-disable-next-line 
    }, [matrices, saveToLocal])
    
    const undo = () => {
        if (undoStack.length > 0) {
            setRedoStack([...redoStack, JSON.stringify(matrices)]);
            setMatrices(JSON.parse(undoStack.pop()))
        } else {
            alert("Nothing to undo");
        }
    }

    const redo = () => {
        if (redoStack.length > 0) {
            setUndoStack([...undoStack, JSON.stringify(matrices)]);
            setMatrices(JSON.parse(redoStack.pop()));
        } else {
            alert("Nothing to redo");
        }
    }

    //set matrices and update undo stack
    const updateMatrices = (updated) => {
        setUndoStack([...undoStack, JSON.stringify(matrices)]);
        setRedoStack([]);
        
        setMatrices(updated);

    }
            


   
    //used for updating state and local storage
    const updateParameter = (parameterName, updated) => {
        switch (parameterName) {
            case "Empty Element":
                setSparseVal(updated);
                window.localStorage.setItem("Empty Element", updated); 
                break;
            case "Mirror Inputs":
                setMirror(updated);  
                window.localStorage.setItem("Mirror Inputs", updated ? "1" : "0");
                break; 
            case "Disable Selection":
                setSelectable(!updated);
                window.localStorage.setItem("Disable Selection", updated ? "1" : "0");
                break;
            case "Save To Local":
                setSaveToLocal(updated);
                window.localStorage.setItem("Save To Local", updated ? "1" : "0");                
                if (!updated)
                    localStorage.removeItem("matrices");

                break;
            case "Numbers Only Input":
                setNumbersOnly(updated);
                window.localStorage.setItem("Numbers Only Input", updated ? "1" : "0");
                
                break;

                
            case "Show Merge":
                setShowMerge(updated);
                window.localStorage.setItem("Show Merge", updated ? "1" : "0");
                break;

            default: 
                console.log("Invalid?:" + parameterName);
  
        }
    
    }

    //functions related to matrix editing
    const renameMatrix = (oldName, newName) => {     
        if (newName in matrices)
            return false;
        
        const tempObj = {...matrices};
        //rename and delete old one
        tempObj[newName] = tempObj[oldName]; 
        delete tempObj[oldName];

        updateMatrices(tempObj);

        return true;
    }
    
    const updateMatrix = (name = undefined, matrix = undefined) => {
        const tempObj = {...matrices};
        if (name === undefined) { //no name, generate one
            name = generateUniqueName(matrices);
        }
        
        if (matrix === undefined) { //no matrix, generate 1 x 1 one
            tempObj[name] = [["", ""], ["", ""]];
        } else {
            tempObj[name] = matrix;
        }
        
        updateMatrices(tempObj);
        return name; //return name of matrix (mainly for input is undefined)
    }

    const deleteMatrix = (name) => {
        const tempObj = {...matrices};
        delete tempObj[name];
        updateMatrices(tempObj);
    }

    const deleteAllMatrices = () => {
        if (window.confirm("Are you sure you want to delete all of your matrices?")) {
            setSelection("0");
            updateMatrices({});

            localStorage.removeItem("matrices");     
        }

    }

    //functions related to saving
    const saveToLocalStorage = () => {
        saving.current = true
        console.log(JSON.stringify(matrices))
        window.localStorage.setItem("matrices", JSON.stringify(matrices))
        window.localStorage.setItem("Save To Local", saveToLocal ? "1" : "0")
        window.localStorage.setItem("Disable Selection;", selectable ? "1" : "0");
        window.localStorage.setItem("Empty Element", sparseVal)
        saving.current = false
    }

    const loadFromLocalStorage = () => {
        console.log("Loading from local storage...")
        try {
            const matrices = localStorage.getItem("matrices")
            console.log("Found: " + matrices)
            if (matrices === null)
                throw new Error("No matrices found in local storage");

            const parsed = JSON.parse(matrices);            
            if (parsed.length === 0) { //if {} is saved, it will be parsed to []
                throw new Error("No matrices found in local storage");
            } else {
                setMatrices(parsed);

                const localMatrices = Object.keys(parsed);
                if (localMatrices.length > 0)
                    setSelection(localMatrices[0]);
                else
                    setSelection("0");
                
            }

        } catch (error) {
            console.log(error)
            localStorage.removeItem("matrices");

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

        //if all is set to null (log out or invalid tokens), then load local storage
        if (!username && !access_token && !refresh_token) {
            setUndoStack([]);
            setRedoStack([]);
            loadFromLocalStorage(); 
        }

    }

    const getMatrixData = async () => {        
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
        const response = await fetch(url, {
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
        }).catch((error) => {
            console.log(error)
            alert("Error connecting to server")
            return null;
        });

        if (response === null) {
            if (await refreshTokens()) { 
                return getMatrixData(); //retry
            } else { //refresh token invalid
                console.log("Unauthorized. Refresh token invalid."); 
                return;
            }
        }

        
        const userMatrices = JSON.parse(response["matrix_data"]); //matrices saved in database
        var localMatricesStr = localStorage.getItem("matrices"); 

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
            updateParameter("Show Merge", false);
            setMatrices(userMatrices)
            if (Object.keys(userMatrices).length > 0)
                setSelection(Object.keys(userMatrices)[0])
            else
                setSelection("0");
           
        } else {
            updateParameter("Show Merge", true);
            setUserMatrices(userMatrices);
            
            if (!matrices || saveToLocal) //if the page is loading, load from local storage if enabled.
                loadFromLocalStorage();
            //otherwise, the merge request was made after the page finished laoding, so don't re load from local storage

           
        }
    }

    const updateAccountMatrices = async () => {
        saving.current = true
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/matrix`;
        const response = await fetch(url, {
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
                console.log("Unauthorized. Refresh token invalid.");
                return;
            }
        }

        saving.current = false
    }

    const refreshTokens = async () => {
        const url = `${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/api/token`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("refresh_token")
            }
        }).then((response) => {
            if (response.status === 401) { //invalid refresh token
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

            return true; //tokens successfully refreshed
        } else {
            updateUserInfo(null, null, null);
            localStorage.removeItem("refresh_token");
            return false; //failed to refresh tokens
        }
    }
       
    if (!matrices)
        return <div />
        
    return (
        <div> 
            <Navigation 
                matrices = {matrices} 
                selection = {selection}
                matrix = {matrices[selection]}

                updateParameter = {updateParameter}
                setSelection = {setSelection}
                updateMatrices = {updateMatrices}

                mirror = {mirror}
                numbersOnly = {numbersOnly}
                sparseVal = {sparseVal}
                selectable = {selectable}

                updateMatrix = {updateMatrix}
                deleteMatrix = {deleteMatrix}
                renameMatrix = {renameMatrix}
                saveToLocalStorage = {saveToLocalStorage}
                deleteAllMatrices = {deleteAllMatrices}

                username = {username}
                updateUserInfo = {updateUserInfo}
                refreshTokens = {refreshTokens}
                saveToLocal = {saveToLocal}
                setSaveToLocal = {setSaveToLocal}

                showMerge = {showMerge}
                setShowMerge = {setShowMerge}
                userMatrices = {userMatrices}
                dataTooLarge = {dataTooLarge}
                
                firstVisit = {firstVisit}
            />

        

            {(selection in matrices) ? 
            <MatrixEditor
                matrix = {matrices[selection]} 
                matrices = {matrices}
                name = {selection} 
                
                updateParameter = {updateParameter}
                mirror = {mirror}
                sparseVal = {sparseVal}
                numbersOnly = {numbersOnly}
                selectable = {selectable}

                updateMatrix = {updateMatrix}

                firstVisit = {firstVisit}

                undo = {undo}
                canUndo = {undoStack.length > 0}
                redo = {redo} 
                canRedo = {redoStack.length > 0}
                                
            /> 
            : 
            <div ref = {optionsBarRef} className={matrixEditorStyles.optionsBar}>
                 <ActiveButton
                    name="Import Matrix From Text"
                    active={showImport}
                    action={() => {setShowImport(!showImport)}}
                />

                {showImport ?
                <TextImport
                    updateMatrix={updateMatrix}
                    matrices={matrices}
                    currentName={null}
                    close={() => { setShowImport(false) }}
                    active={showImport}
                    optionsBarRef = {optionsBarRef}
                />
                : null}

                <BasicActionButton disabled = {undoStack.length === 0} name = "↺" action = {undo} />   
                <BasicActionButton disabled = {redoStack.length === 0} name = "↻" action = {redo} />

            </div>} 
    

        </div>);

}

export default App;
