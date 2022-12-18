
interface ActiveButtonProps {
    action: any
    name: string
    active: boolean
    id?: string
}
const ActiveButton = (props: ActiveButtonProps) => {
    return <button
            id={props.name}
            onClick={props.action}
            className={(props.active ? "btn btn-info" : "btn btn-secondary")}
        >
            {props.name}
        </button>
}

export default ActiveButton;