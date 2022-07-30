import React, {useState, useEffect} from 'react'; 
import ParameterBoxInput from '../inputs/ParameterBoxInput';
import ParameterTextInput from '../inputs/ParameterTextInput';

import Tutorial from './Tutorial';
import SelectorButton from './buttons/SelectorButton';
import MenuButton from './buttons/MenuButton';

import "./Navigation.css"

function Navigation(props) {
    const [selectors, setSelectors] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchSize, setSearchSize] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

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
        var tempSelectors = []

        if (searchSize !== "") {
            var split = searchSize.split("x");
            var sizeFilters = [];
            for (var i = 0; i < split.length; i++) {
                var temp = parseInt(split[i])
                if (!isNaN(temp))
                    sizeFilters.push(temp)
            }
        }


        for (var matrixName in props.matrices) {
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
            tempSelectors.push(<div className = "noMatrices">{"No Matrices Found"}</div>);
        else
            tempSelectors.sort( (selector1, selector2)  => {
                return selector1.props.name.toUpperCase() < selector2.props.name.toUpperCase() ? selector1 : selector2;
            });

        setSelectors(tempSelectors);
    // eslint-disable-next-line
    }, [props.matrices, props.selection, searchName, searchSize]);

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
        var rows = matrix.length - 1;
        var cols = matrix[0].length - 1;

        if (sizeFilters.length === 1) //only a number entered
            return rows === sizeFilters[0] || cols === sizeFilters[0]
        else //n x m entered
            return rows === sizeFilters[0] && cols === sizeFilters[1];
            
    }

    function closeTutorial() {
        setShowTutorial(false);
    }

    return  <div className = "row navigateBar">
        {showTutorial ? <Tutorial closeTutorial = {closeTutorial}/> : null}

        <div className = "col-sm-4 info">
            <div id = "selectors" className="list-group">
                    <MenuButton
                        key = "addButton" 
                        text = {"Create New Empty Matrix"}
                        buttonStyle = {"info"}
                        action = {() => {props.setMatrix()}} />
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
                        buttonStyle = {"danger"} 
                        action = {props.deleteAllMatrices}
                    />
                    : null}

                    
                </div> 
        </div>

        <div className = "col-sm-4">
            <input className = "nameSearchBar" onChange = {updateSearchName} value = {searchName} placeholder='Search by Name'></input>
            <input className = "sizeSearchBar" onChange = {updateSearchSize} value = {searchSize} placeholder='Search by Size'></input>

            <div id = "selectors" className="list-group">
                {selectors}    
            </div>
        </div>

        <div className = "col-sm-4 info">
            <div id = "selectors" className="list-group">
                {!showTutorial ? 
                <MenuButton 
                    text = {"Show Tutorial"}
                    buttonStyle = {"info"}
                    action = {() => {setShowTutorial(true)}}
                />: null}
                
                {props.autoSave ? null : 
                <MenuButton 
                    text = {"Save Matrices"}
                    buttonStyle = {"success"}
                    action = {() => {
                        props.saveToLocalStorage();
                        alert("Matrices saved to local browser storage.");
                    }}/>
                }
               
                <MenuButton 
                    text = {showSettings ? "Hide Settings" : "Settings"}
                    buttonStyle = {"primary"}
                    action = {() => {setShowSettings(!showSettings)}}
                />
                
            </div>


            {showSettings ? 
            <div className = "settingsMenu">               
                <ParameterBoxInput isChecked = {props.autoSave} id = {"autoSave"} name={"autoSave"} text = {"Auto Save"} updateParameter={props.updateParameter}/>
                <ParameterBoxInput isChecked = {props.mirror} id = {"mirror"} name={"mirror"} text = {"Mirror Inputs"} updateParameter={props.updateParameter}/>
                {"Empty Element:"} <ParameterTextInput width = {"30px"} text = {props.sparseVal} id={"sparse"} updateParameter={props.updateParameter}/>
            </div> : null}

        </div>



    </div>
}


export default Navigation;
