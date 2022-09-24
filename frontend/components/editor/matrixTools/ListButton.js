import React from "react";

import styles from "./ListButton.module.css";

const ListButton = (props) => {
    return <li>
        <button
            id={props.name}
            onClick={props.action}
            className={styles.listButton + (props.active ? " btn btn-info" : " btn btn-secondary")}
        >
            {props.name}
        </button>
    </li>
}

export default ListButton;