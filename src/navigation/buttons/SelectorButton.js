import React, {useState} from 'react';
import "./SelectorButton.css";

function SelectorButton(props) {
    const [displaySize, setDisplaySize] = useState( realSize() );
    const [displayName, setDisplayName] = useState(props.name);
    
    function realSize() {
        return (props.matrices[props.name].length - 1) + " x " +
        (props.matrices[props.name][0].length - 1);
    }

    function updateMatrixSelection() {
        props.updateMatrixSelection(props.name);
    }

    function renameMatrix(e) {
        var updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated)) {
           setDisplayName(updated);
        }

    }

    function handleFocus(e) {
        var rows = props.matrices[props.name].length - 1
        var cols = props.matrices[props.name][0].length - 1

        setDisplaySize((rows) + " x " + cols);
    }

    function resizeMatrix(e) {
        var updated = e.target.value;

        if (/^[0-9 \s]*[x]?[0-9 \s]*$/.test(updated)) {
            setDisplaySize(updated);
        }
    }

    function pushNewName() {
        if (displayName !== props.name)
            if (displayName === "") {
                alert("The name can not be blank!")
                setDisplayName(props.name);
            } else if (displayName in props.matrices) {
                alert("The name " + displayName + " already exists!")
                
                setDisplayName(props.name);
            } else {
                props.renameMatrix(props.name, displayName)
                props.updateSelection(displayName)
            }
    }

    function pushNewSize() { 
        if (/[0-9]* ?x ?[0-9]*/.test(displaySize)) {
            var rows = parseInt(displaySize.substring(0, displaySize.indexOf("x")));
            var cols = parseInt(displaySize.substring(displaySize.indexOf("x") + 1));
            
            if (rows > 0 && cols > 0) {
                setDisplaySize((rows) + " x " + cols);
                
                props.resizeMatrix(props.name, rows + 1, cols + 1);

            } else {
                alert("Dimensions can not be zero");
                setDisplaySize(realSize());
            }
        } else {         
            setDisplaySize(realSize());
        }
    }

    function handleKeyDown(e) {
        if (e.keyCode === 13) {
            e.target.blur();
        }
    }



    if (document.activeElement === document.getElementById("size " + props.name)) {
        var size = displaySize
    } else {
        size = realSize();
    }


    return <button type="button" 
        className = {"list-group-item list-group-item-action" + ((props.active) ? " active" : "")}
        onClick = {updateMatrixSelection}>

        <input 
        value = {displayName} 
        id = {props.name}
        type = "text" 
        className = "selectorInput"
        onChange = {renameMatrix}
        onKeyDown = {handleKeyDown}
        onBlur = {pushNewName}
        onFocus = {handleFocus}
        />

        <input 
        value = {size} 
        id = {"size " + props.name}
        type = "text"
        className = "sizeInfo selectorInput" 
        onChange = {resizeMatrix}
        onBlur = {pushNewSize}
        onFocusCapture = {handleFocus}
        onKeyDown = {handleKeyDown}
        />
    </button>

    

}

export default SelectorButton;