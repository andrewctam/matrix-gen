import styles from "./SaveMatrices.module.css";

const SaveInput = (props) => {
    return (
        <div>
            <label htmlFor={props.name} className={styles.loginLabel}>{props.name}</label>
            <input className={styles.loginInput} id={props.name} type={props.type} value={props.current} onChange={(e) => { props.setCurrent(e.target.value) }} />

            {props.error ?
                <label htmlFor={props.name} className={styles.errorLabel}>{props.error}</label>
                : null}

            {props.success ?
                <label htmlFor={props.name} className={styles.successLabel}>{props.success}</label>
                : null}
        </div>)

}
export default SaveInput;