import styles from './Toggle.module.css'

const Toggle = (props) => {
    return <div 
        className = {styles.toggle} 
        onClick = {props.toggle}>

        {props.show ? String.fromCharCode(8593) : String.fromCharCode(8595)}
    </div>

}

export default Toggle