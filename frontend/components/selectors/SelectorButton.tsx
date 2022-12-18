import React, { useState } from 'react';
import styles from "./Selectors.module.css"

interface SelectorButtonProps {
    key: string
    name: string
    rows: number
    cols: number
    setSelection: (str: string) => void
    toggleMultiSelect: (name: string | undefined) => void
    pushNewName: (oldName: string, newName: string) => boolean
    pushNewSize: (oldName: string, newName: string) => boolean
    active: boolean
    multiSelected: boolean
    intersectionMerge: boolean

}
const SelectorButton = (props: SelectorButtonProps) => {
    const [displayName, setDisplayName] = useState("");
    const [editingName, setEditingName] = useState(false);

    const [displaySize, setDisplaySize] = useState("");
    const [editingSize, setEditingSize] = useState(false);
    

    const updateRename = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const updated = (e.target as HTMLInputElement).value;
        if (/^[A-Za-z_]*$/.test(updated))
            setDisplayName(updated);
    }

    const updateResize = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const updated = (e.target as HTMLInputElement).value;
        if (/^[0-9 \s]*[x]?[0-9 \s]*$/.test(updated))
            setDisplaySize(updated);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        }
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        //check for control
        if (e.metaKey) {
            props.toggleMultiSelect(props.name);
        } else {
            props.setSelection(props.name);
            props.toggleMultiSelect(undefined);
        }

    }

    let className = styles.matrixSelector +  " list-group-item list-group-item-action ";
    if (props.active)
        className += styles.active + " ";
    if (props.multiSelected)
        className += styles.multiSelected;


    return <button type="button"
        className={className}
        onClick={handleClick}>

        <input
            value={editingName ? displayName : props.name}
            id={props.name}
            type="text"
            className={`${styles.renameInput} ${props.intersectionMerge ? styles.intersectionMerge : ""}`}
            onInput={updateRename}
            onKeyDown={handleKeyDown}
            onFocus = {() => {
                setDisplayName(props.name); //default to current name
                setEditingName(true);
            }}
            onBlur={() => {
                setEditingName(false);
                if (!props.pushNewName(props.name, displayName))
                    setDisplayName(props.name)
                else   
                    setDisplayName("") //clear the input if failed
            }}
        />


        <input
            value={editingSize ? displaySize : `${props.rows} x ${props.cols}`}
            id={"size " + props.name}
            type="text"
            className={styles.sizeInput}
            onInput={updateResize}
            onFocus = {() => {
                setDisplaySize(`${props.rows} x ${props.cols}`) //default to current size
                setEditingSize(true);
            }}
            onBlur={() => {
                setEditingSize(false);
                if (displaySize !== "" && 
                    displaySize !== `${props.rows} x ${props.cols}` && 
                    !props.pushNewSize(props.name, displaySize))

                    setDisplaySize(`${props.rows} x ${props.cols}`)
                else   
                    setDisplaySize("") //clear the input if failed
            }}
            onKeyDown={handleKeyDown}
        />
    </button>



}

export default SelectorButton;