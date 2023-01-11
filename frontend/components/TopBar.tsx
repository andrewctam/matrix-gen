import React, { useState } from 'react';
import { useAppSelector } from '../hooks/hooks';
import styles from "./App.module.css";
import SaveMatrices from './saving/SaveMatrices';


const enum Hovering { None, Saving, Tutorial }

const TopBar = () => {
    const [hovering, setHovering] = useState<Hovering>(Hovering.None);
    const [showSaveMenu, setShowSaveMenu] = useState(false);

    const {username, mergeConflict, saveToLocal} = useAppSelector((state) => state.user)


    if (mergeConflict) {
        var saving = `Logged in as ${username}. There is currently a storage conflict.`;
    } else if (username) {
        if (saveToLocal)
            saving = `Logged in as ${username}. Matrices will be saved to your account and to your local browser's storage.`;
        else
            saving = `Logged in as ${username}. Matrices will be saved to your account.`;
    } else if (saveToLocal) {
        saving = `Matrices will be saved to your local browser's storage.`;
    } else {
        saving = "Matrices will not be saved if you refresh the page.";
    }



    return <div className={"position-relative"}>
       <div className = {styles.topBar}>
            
            <div className={styles.savingInfo}
                style={{ color: hovering === Hovering.Saving ? (saveToLocal || username ? "rgb(147, 221, 165)" : "rgb(247, 198, 198)") : "white" }}
                onMouseEnter={() => { setHovering(Hovering.Saving) }}
                onMouseLeave={() => { setHovering(Hovering.None) }}
                onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowSaveMenu(!showSaveMenu); 
                }}>

                {saving + (showSaveMenu ? " ↑" : " Click for options ↓")}
            </div>
        

            
            <a className={styles.tutorialLink} 
                style={{ color: hovering === Hovering.Tutorial ? "rgb(100, 198, 198)" : "white" }}
                onMouseEnter={() => { setHovering(Hovering.Tutorial) }}
                onMouseLeave={() => { setHovering(Hovering.None) }}
                href = "/tutorial" target = "_blank">
                {"?"}
            </a>
        </div>

        <div className={styles.floatingContainer}>
            {showSaveMenu ?
                <SaveMatrices closeSaveMenu={() => { setShowSaveMenu(false) }} />
            : null}
        </div>

    </div>
}


export default TopBar;
