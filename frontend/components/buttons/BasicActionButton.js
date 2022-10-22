
const BasicActionButton = (props) => {
    return <button
            className={`btn btn-${props.buttonStyle} inline`}
            onClick={props.action}
            disabled={props.disabled}
        >
        {props.name}
    </button>
}

export default BasicActionButton;