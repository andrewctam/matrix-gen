import React, { useState } from 'react';
import styles from "./Selectors.module.css"

const SelectorButton = (props) => {
    const [displayName, setDisplayName] = useState("");
    const [editingName, setEditingName] = useState(false);

    const [displaySize, setDisplaySize] = useState("");
    const [editingSize, setEditingSize] = useState(false);
    

    const updateRename = (e) => {
        const updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated))
            setDisplayName(updated);
    }

    const updateResize = (e) => {
        const updated = e.target.value;
        if (/^[0-9 \s]*[x]?[0-9 \s]*$/.test(updated))
            setDisplaySize(updated);
    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.target.blur();
        }
    }

    const handleClick = (e) => {
        e.stopPropagation();

        //check for control
        if (e.metaKey) {
            props.toggleMultiSelect(props.name);
        } else {
            props.setSelection(props.name);
            props.toggleMultiSelect(null, true);
        }

    }

    let className = styles.matrixSelector +  " list-group-item list-group-item-action ";
    if (props.active)
        className += styles.active + " ";
    if (props.multiSelected)
        className += styles.multiSelected;


    console.log(props)
    return <button type="button"
        className={className}
        onClick={handleClick}>

        <input
            value={editingName ? displayName : props.name}
            id={props.name}
            type="text"
            className={`${styles.renameInput} ${props.intersectionMerge ? styles.intersectionMerge : ""}`}
            onChange={updateRename}
            onKeyDown={handleKeyDown}
            onFocus = {() => {
                setDisplayName(props.name);
                setEditingName(true);
            }}
            onBlur={() => {
                setEditingName(false);
                if (!props.pushNewName(props.name, displayName))
                    setDisplayName(props.name)
                else   
                    setDisplayName("")
            }}
        />


        <input
            value={editingSize ? displaySize : `${props.rows} x ${props.cols}`}
            id={"size " + props.name}
            type="text"
            className={styles.sizeInput}
            onChange={updateResize}
            onFocus = {() => {
                setDisplaySize(`${props.rows} x ${props.cols}`)
                setEditingSize(true);
            }}
            onBlur={() => {
                setEditingSize(false);
                if (!props.pushNewSize(props.name, displaySize))
                    setDisplaySize(`${props.rows} x ${props.cols}`)
                else   
                    setDisplaySize("")
            }}
            onKeyDown={handleKeyDown}
        />
    </button>



}

export default SelectorButton;