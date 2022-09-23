
import styles from "./Login.module.css";

const MergeStorage = (props) => {
    const merge = () => {
        var intersection = Object.keys(props.matrices).filter(x => props.userMatrices.hasOwnProperty(x));
        var union = { ...props.matrices, ...props.userMatrices };

        //a dupe in userMatrices will overwrite the cooresponding dupe in matrices, so rename the dupe in matrices and readd it
        for (let i = 0; i < intersection.length; i++) {
            const originalName = props.matrices[intersection[i]];

            intersection[i] += "_Local"
            while (intersection[i] in union) {
                intersection[i] += "_";
            }

            union[intersection[i]] = originalName;
        }

        props.setMatrices(union);
        props.updateParameter("showMerge", false)
    }

    const overwriteLocal = () => {
        props.setMatrices(props.userMatrices);
        props.setSelection(Object.keys(props.userMatrices)[0]);
        props.updateParameter("showMerge", false)
    }
    

    return <div className = {styles.mergeStorage}>
        <label className = {styles.mergeStorageText}>{"You currently have changes made to your local matrices. Would you like to merge your local matrices with your account's matrices, or discard the local matrices (and overwrite them with the matrices from your account)?"}</label>

        <button className={"btn btn-secondary " + styles.mergeStorageButton} onClick={merge}>
            Merge Storages
        </button>

        <button className={"btn btn-secondary " + styles.mergeStorageButton} onClick= {overwriteLocal}>
            Discard Local Storage
        </button>

        <label className = {styles.mergeStorageText}>{"The matrices stored in your account will not be loaded or modified until you choose an option. Making changes in the editor below will only affect your local storage until then."}</label>

    </div>
}

export default MergeStorage