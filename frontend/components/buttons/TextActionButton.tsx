import ParameterTextInput from "../inputs/ParameterTextInput";
import styles from "./TextActionButton.module.css"

interface TextActionButtonProps {
    updateParameter: any
    action: any
    value: string
    width: string
    placeholder?: string
    name: string
}

const TextActionButton = (props: TextActionButtonProps) => {
    return <form className={styles.textActionButton} onSubmit={(e) => { e.preventDefault(); props.action(); }}>
        <button className="btn btn-primary" type = "submit">
            {props.name}
        </button>

        <ParameterTextInput
            id={props.name}
            updateParameter={props.updateParameter}
            text={props.value}
            width={props.width}
            placeholder={props.placeholder}
        />
    </form>
}

export default TextActionButton;