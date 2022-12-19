import React, { useEffect, useState, useRef } from 'react';
import styles from "./App.module.css";

interface TopBarProps {
   showTutorial: boolean
   setShowTutorial: (bool: boolean) => void
   showSaveMenu: boolean
   setShowSaveMenu: (bool: boolean) => void

   showMerge: boolean
   username: string
   dataTooLarge: boolean
   saveToLocal: boolean

}

const TopBar = (props: TopBarProps) => {

    const [hovering, setHovering] = useState("");

    useEffect(() => {
        if (localStorage.getItem("First Visit") === null) {
            props.setShowTutorial(true);
        }
    }, []);
    

    if (props.showMerge) {
        var saving = `Logged in as ${props.username}. There is currently a storage conflict.`;
    } else if (props.username) {
        if (props.dataTooLarge) {
            if (props.saveToLocal) {
                saving = `Logged in as ${props.username}. Matrices are too large and new changes may not be saved to your account, but they will be saved to local storage.`;
            } else {
                saving = `Logged in as ${props.username}. WARNING: Matrices are too large and new changes may not be saved to your account. Please decrease matrices' size or enable saving to local storage. `;

            }
        } else if (props.saveToLocal)
            saving = `Logged in as ${props.username}. Matrices will be saved to your account and to your local browser's storage.`;
        else
            saving = `Logged in as ${props.username}. Matrices will be saved to your account.`;
    } else if (props.saveToLocal) {
        saving = `Matrices will be saved to your local browser's storage.`;
    } else {
        saving = "Matrices will not be saved if you refresh the page.";
    }



    return <div className={"position-relative"}>
       <div className = {styles.topBar}>
            
            <div className={styles.savingInfo}
                style={{ color: hovering === "saving" ? (props.saveToLocal || props.username ? "rgb(147, 221, 165)" : "rgb(247, 198, 198)") : "white" }}
                onMouseEnter={() => { setHovering("saving") }}
                onMouseLeave={() => { setHovering("") }}
                onClick={(e) => { 
                    e.stopPropagation(); 
                    props.setShowSaveMenu(!props.showSaveMenu); 
                    props.setShowTutorial(false) 
                }}>

                {saving + (props.showSaveMenu ? " Click to close the save menu ↑" : " Click to open the save menu ↓")}
            </div>
        

            
            <div className={styles.toggleTutorial} 
                style={{ color: hovering === "tutorial" ? "rgb(100, 198, 198)" : "white" }}
                onMouseEnter={() => { setHovering("tutorial") }}
                onMouseLeave={() => { setHovering("") }}
                onClick={(e) => { 
                    e.stopPropagation(); 
                    props.setShowTutorial(!props.showTutorial);
                    props.setShowSaveMenu(false); 
                }}> {"?"}
            </div>
        </div>

    </div>
}


export default TopBar;
