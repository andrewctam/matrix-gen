import styles from './Toggle.module.css'

const Toggle = (props) => {
    return <div 
        className = {styles.toggle} 
        onClick = {props.toggle}>

        {props.show ? "↑" : "↓"}
    </div>

}

export default Toggle