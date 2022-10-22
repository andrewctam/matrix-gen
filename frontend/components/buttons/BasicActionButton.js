
const BasicActionButton = (props) => {
    return <button
            className={`btn btn-${props.buttonStyle} inline`}
            onClick={props.action}
            disabled={props.disabled}
            ref = {props.innerRef ? props.innerRef : null}  
        >
        {props.name}
    </button>
}

export default BasicActionButton;