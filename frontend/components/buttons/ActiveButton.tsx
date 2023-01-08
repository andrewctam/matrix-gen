
interface ActiveButtonProps {
    action: any
    name: string
    active: boolean
    id?: string
    disabled?: boolean
}
const ActiveButton = (props: ActiveButtonProps) => {
    return <button
            id={props.name}
            onClick={props.action}
            className={(props.active ? "btn btn-info" : "btn btn-secondary")}
            disabled={props.disabled}
        >
            {props.name}
        </button>
}

export default ActiveButton;