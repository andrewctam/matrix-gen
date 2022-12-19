
import { Matrices } from "../App";
import styles from "./MergeStorage.module.css";

interface MergeStorageProps {
    matrices: Matrices
    userMatrices: Matrices
    matrixDispatch: React.Dispatch<any>
    setSelection: (str: string) => void
    setShowMerge: (bool: boolean) => void
    addAlert: (str: string, time: number, type?: string) => void
}

const MergeStorage = (props: MergeStorageProps) => {

    const merge = () => {
    
        // @ts-ignore, userMatrices won't be nyll
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

        if (JSON.stringify(union).length > 512000) {
            props.addAlert("Merging your matrices will exceed the maximum storage limit for accounts. Please delete some local matrices before merging.", 10000, "error");
            return;
        }

        props.matrixDispatch({"type": "UPDATE_ALL", "payload": {"matrices": union}});
        
        props.setShowMerge(false);
    }

    const overwriteLocal = () => {
        props.matrixDispatch({"type": "UPDATE_ALL", "payload": {"matrices": props.userMatrices}});
        const accountMatrices = Object.keys(props.userMatrices)
        if (accountMatrices.length > 0) {
            props.setSelection(Object.keys(props.userMatrices)[0]);
        } else {
            props.setSelection("");
        }

        props.setShowMerge(false);  
    }


    return <div className={styles.mergeStorage}>
        <label className={styles.mergeStorageText}>{"You currently have changes made to your local matrices. Would you like to merge your local matrices with your account's matrices, or discard the local matrices (and overwrite them with the matrices from your account)?"}</label>

        <button className={"btn btn-secondary " + styles.mergeStorageButton} onClick={merge}>
            Merge Storages
        </button>

        <button className={"btn btn-secondary " + styles.mergeStorageButton} onClick={overwriteLocal}>
            Discard Local Storage
        </button>

        <label className={styles.mergeStorageText}>{"The matrices stored in your account will not be loaded or modified until you choose an option. Making changes in the editor below will only affect your local storage until then."}</label>
        <label className={styles.mergeStorageText}>{"If you merge storages and two matrices have the same name, the local matrix will be renamed to avoid duplicates. Local matrices that share the same name with one on your account are indicated with a blue name below."}</label>

    </div>
}

export default MergeStorage