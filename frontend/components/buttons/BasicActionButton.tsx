interface BasicActionButtonProps {
    action: any
    name: string
    buttonStyle: string
    disabled?: boolean
    innerRef?: React.MutableRefObject<any>
}

const BasicActionButton = (props: BasicActionButtonProps) => {
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