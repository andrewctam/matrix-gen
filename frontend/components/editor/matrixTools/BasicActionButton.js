
const BasicActionButton = (props) => {
    return  <button 
                className = "btn btn-primary inline" 
                onClick={props.action}
            >
            {props.name}
            </button>
}

export default BasicActionButton;