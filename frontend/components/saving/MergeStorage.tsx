
import { useContext } from "react";
import { Matrices, updateAllMatrices, updateSelection } from "../../features/matrices-slice";
import { resolveMergeConflict } from "../../features/user-slice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { AlertContext } from "../App";
import styles from "./MergeStorage.module.css";


const MergeStorage = () => {
    const {matrices} = useAppSelector((state) => state.matricesData);
    const {userMatrices} = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();

    const addAlert = useContext(AlertContext);
    
    const merge = () => {
        // @ts-ignore, userMatrices won't be nyll
        var intersection = Object.keys(matrices).filter(x => props.userMatrices.hasOwnProperty(x));
        var union = { ...matrices, ...userMatrices };

        //a dupe in userMatrices will overwrite the cooresponding dupe in matrices, so rename the dupe in matrices and readd it
        for (let i = 0; i < intersection.length; i++) {
            const originalName = matrices[intersection[i]];

            intersection[i] += "_Local"
            while (intersection[i] in union) {
                intersection[i] += "_";
            }

            union[intersection[i]] = originalName;
        }

        if (JSON.stringify(union).length > 512000) {
            addAlert("Merging your matrices will exceed the maximum storage limit for accounts. Please delete some local matrices before merging.", 10000, "error");
            return;
        }

        dispatch(updateAllMatrices({"matrices": union}))
        dispatch(resolveMergeConflict())
    }

    const overwriteLocal = () => {
        if (!userMatrices)
            return;

        dispatch(updateAllMatrices({"matrices": userMatrices}))
        const accountMatrices = Object.keys(userMatrices)
        if (accountMatrices.length > 0) {
            dispatch(updateSelection(Object.keys(userMatrices)[0]))
        } else {
            dispatch(updateSelection(""))
        }

        dispatch(resolveMergeConflict())
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