import React from "react";

const ListButton = (props) => {
    return <button
            id={props.name}
            onClick={props.action}
            className={(props.active ? "btn btn-info" : "btn btn-secondary")}
        >
            {props.name}
        </button>
}

export default ListButton;