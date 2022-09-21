import React, {useState, useEffect} from 'react'; 
import ParameterBoxInput from '../inputs/ParameterBoxInput';
import ParameterTextInput from '../inputs/ParameterTextInput';

import Login from './Login';
import Tutorial from './Tutorial';
import SelectorButton from './buttons/SelectorButton';
import MenuButton from './buttons/MenuButton';
import TextActionButton from "../editor/matrixTools/TextActionButton"
import styles from "./Navigation.module.css";

function Navigation(props) {
    const [selectors, setSelectors] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchSize, setSearchSize] = useState("");
    
    const [showSettings, setShowSettings] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(true);
    const [identitySize, setIdentitySize] = useState(3);

    useEffect(() => {
        if (window.localStorage.getItem("firstVisit;") === null) {
            setShowTutorial(true);
            window.localStorage.setItem("firstVisit;", "0");
        }
    }, []) 
    /*
    useEffect(() => {
        document.getElementById("selectors").scrollTop = document.getElementById("selectors").scrollHeight;
        console.log(document.getElementById("selectors").scrollHeight);
    }, [selectors])
    */

    useEffect(() => {
        const tempSelectors = []

        const sizeFilters = [];
        const split = searchSize.split("x");
        if (searchSize !== "") {
            for (let i = 0; i < split.length; i++) {
                const temp = parseInt(split[i])
                if (!isNaN(temp))
                    sizeFilters.push(temp)
            }
        }


        for (const matrixName in props.matrices) {
            if ((searchName === "" || matrixName.startsWith(searchName)) && 
                (searchSize === "" || verifySize(matrixName, sizeFilters)))
                tempSelectors.push (
                    <SelectorButton 
                        name = {matrixName}
                        key = {matrixName}
                        updateMatrixSelection = {props.updateMatrixSelection}
                        renameMatrix = {props.renameMatrix}
                        resizeMatrix = {props.resizeMatrix}
                        active = {props.selection === matrixName}
                        matrices = {props.matrices}/>
                    )
        }


        if (tempSelectors.length === 0)
            tempSelectors.push(<div className = {styles.noMatrices}>{"No Matrices Found"}</div>);
        else
            tempSelectors.sort( (selector1, selector2)  => {
                return selector1.props.name.toUpperCase() < selector2.props.name.toUpperCase() ? selector1 : selector2;
            });

        setSelectors(tempSelectors);
    // eslint-disable-next-line
    }, [props.matrices, props.selection, searchName, searchSize]);

    function updatePresetParameter(parameterName, updated) {
        switch(parameterName) {
            case "Identity Matrix ":
                if (/^-?[0-9 \s]*$/.test(updated)) 
                    setIdentitySize(updated);
                    break;

            default: break;
        }
    }
    function updateSearchName(e) {
        const updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated))
            setSearchName(updated);
    }

    function updateSearchSize(e) {
        const updated = e.target.value;
        if (/^[0-9 \s]*[x]?[0-9 \s]*$/.test(updated)) 
            setSearchSize(updated);
    }

    
    function verifySize(name, sizeFilters) {
        const matrix = props.matrices[name];
        const rows = matrix.length - 1;
        const cols = matrix[0].length - 1;

        if (sizeFilters.length === 1) //only a number entered
            return rows === sizeFilters[0] || cols === sizeFilters[0]
        else //n x m entered
            return rows === sizeFilters[0] && cols === sizeFilters[1];
            
    }

    function closeTutorial() {
        setShowTutorial(false);
    }

    function closeSaveMenu() {
        setShowSaveMenu(false);
    }



    
    return  <div className = {"row " + styles.navigateBar}>
        {showSaveMenu ?
        <Login 
            username = {props.username}
            updateUserInfo = {props.updateUserInfo} 
            saveToLocal = {props.saveToLocal} 
            updateParameter = {props.updateParameter}
            
            setMatrices = {props.setMatrices}
            setSelection = {props.setSelection}
            closeSaveMenu = {closeSaveMenu}
            /> : null}

        {showTutorial ? <Tutorial closeTutorial = {closeTutorial}/> : null}

        <div className = {"col-sm-4 " + styles.info}>
            <div id = "selectors" className="list-group">
                    <MenuButton
                        key = "addButton" 
                        text = {"Create New Empty Matrix"}
                        buttonStyle = {"info"}
                        action = {() => {
                            var newName = props.setMatrix();
                            props.updateMatrixSelection(newName);
                        }} 
                        />

                    {props.selection !== "0" ?
                    <MenuButton 
                        key = "duplicateButton" 
                        buttonStyle = {"warning"}
                        text = {`Duplicate Matrix ${props.selection}`}
                        action = {() => {props.copyMatrix(props.selection)}} />
                    : null}

                    {props.selection !== "0" ?
                    <MenuButton 
                        key = "deleteButton" 
                        buttonStyle = {"danger"}
                        text = {`Delete Matrix ${props.selection}`}
                        action = {() => {
                            if (props.selection !== "0" && window.confirm("Are you sure you want to delete " + props.selection + "?")) {
                                props.deleteMatrix(props.selection); 
                                props.updateMatrixSelection("0");
                            }
                        }}/>
                    : null}

                    {Object.keys(props.matrices).length > 0 ?
                    <MenuButton 
                        text = {"Delete All Matrices"}
                        buttonStyle = {"bigDanger"} 
                        action = {props.deleteAllMatrices}
                    />
                    : null}

                    
                </div> 
        </div>

        <div className = "col-sm-4">
            <input className = {styles.nameSearchBar} onChange = {updateSearchName} value = {searchName} placeholder='Search by Name'></input>
            <input className = {styles.sizeSearchBar} onChange = {updateSearchSize} value = {searchSize} placeholder='Search by Size'></input>

            <div id = "selectors" className="list-group"> {selectors} </div>
        </div>

        <div className = {"col-sm-4 " + styles.info}>
            <div id = "selectors" className="list-group">
                <MenuButton 
                    text = {showTutorial ? "Hide Tutorial" : "Show Tutorial"}
                    buttonStyle = {"info"}
                    action = {() => {setShowTutorial(!showTutorial)}}
                />
                
                <MenuButton 
                    text = {showSaveMenu ? "Close Save Menu" : "Save Matrices"}
                    buttonStyle = {"success"}
                    action = {() => {
                        setShowSaveMenu(!showSaveMenu)
                    }}
                />
        
               
                <MenuButton 
                    text = {showPresets ? "Hide Presets" : "Preset Matrices"}
                    buttonStyle = {"primary"}
                    action = {() => {setShowPresets(!showPresets)}}
                />

                <MenuButton 
                    text = {showSettings ? "Hide Settings" : "Settings"}
                    buttonStyle = {"secondary"}
                    action = {() => {setShowSettings(!showSettings)}}
                />

           
                
            </div>
            
            {showPresets ? 
            <div className = {styles.settingsMenu}>               
                <TextActionButton 
                 name = "Identity Matrix "
                 action = {() => {props.createIdentity(parseInt(identitySize))}}
                 updateParameter = {updatePresetParameter}
                 width = {"40px"}
                 value = {identitySize}
                 />
            </div> : null}
            

            {showSettings ? 
            <div className = {styles.settingsMenu}>               
                <ParameterBoxInput isChecked = {props.mirror} id = {"mirror"} name={"mirror"} text = {"Mirror Inputs"} updateParameter={props.updateParameter}/>
                <ParameterBoxInput isChecked = {props.selectable} id = {"selectable"} name={"selectable"} text = {"Enable Selection"} updateParameter={props.updateParameter}/>
                {"Empty Element:"} <ParameterTextInput width = {"30px"} text = {props.sparseVal} id={"sparse"} updateParameter={props.updateParameter}/>
            </div> : null}

            

        </div>



    </div>
}


export default Navigation;
