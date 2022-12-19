import ParameterTextInput from "../inputs/ParameterTextInput";
import styles from "./TextActionButton.module.css"

interface TwoTextActionButtonProps {
    name: string
    id1: string
    id2: string
    updateParameter: any
    placeholder1?: string
    placeholder2?: string
    value1: string
    value2: string
    width: string
    separator: string
    action: any
}

const TwoTextActionButton = (props: TwoTextActionButtonProps) => {
    return <form className={styles.textActionButton} onSubmit={(e) => { e.preventDefault(); props.action() }}>
        <button className="btn btn-primary" type = "submit">
            {props.name}
        </button>

        <ParameterTextInput
            id={props.id1}
            updateParameter={props.updateParameter}
            placeholder={props.placeholder1}
            text={props.value1}
            width={props.width} />

        {props.separator}

        <ParameterTextInput
            id={props.id2}
            updateParameter={props.updateParameter}
            text={props.value2}
            placeholder={props.placeholder2}
            width={props.width} />
    </form>



}

export default TwoTextActionButton;