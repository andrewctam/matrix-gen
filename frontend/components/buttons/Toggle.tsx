import styles from './Toggle.module.css'

interface ToggleProps {
    toggle: any
    show: boolean
}
const Toggle = (props: ToggleProps) => {
    return <div
        className={styles.toggle}
        onClick={props.toggle}>

        {props.show ? "↑" : "↓"}
    </div>

}

export default Toggle