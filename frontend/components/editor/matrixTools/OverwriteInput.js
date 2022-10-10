import ParameterBoxInput from "../../inputs/ParameterBoxInput";


const OverwriteInput = (props) => {
    return (<div>

        <ParameterBoxInput isChecked = {props.overwrite} name = {"Overwrite Current Matrix"} updateParameter = {props.updateParameter}/>

        {!props.overwrite ? 
        <div>
            {"Save as New Matrix: "}
            <input
                id = {props.id}
                placeholder={props.placeholder} 
                value = {props.newName}
                onChange={(e) => {props.updateParameter(e.target.id, e.target.value)}} 
            />
        </div>
        : null}
    </div>

    );
}

export default OverwriteInput;