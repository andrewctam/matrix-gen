import { useCallback, useMemo, useReducer, useState } from "react";

const useAlert = () => {
    const [count, setCount] = useState(0);

    const createAlert = ((msg, time, type = "success") => {
        const timeout = setTimeout(() => {
            dispatch({ type: "REMOVE_ALERT", payload: { "id": count } })
        }, time)

        const alert = (
            <div
                key={`alert${count}`}
                className={`alert ${type === "error" ? "error-alert" : "normal-alert"}`}
                onClick={() => {
                    dispatch({ type: "REMOVE_ALERT", payload: { "id": count } })
                }}>

                <p>{msg}</p>
            </div>
        )
        
        setCount(count + 1);


        return {
            index: count,
            alert: alert,
            timeout: timeout
        };

    })

    const reducer = (state, action) => {
        switch (action.type) {
            case "ADD_ALERT":
                return [...state, createAlert(action.payload.msg, action.payload.time, action.payload.type)];

            case "REMOVE_ALERT":
                const alert = state.find(alert => alert.index === action.payload.id);
                if (alert) {
                    clearTimeout(alert.timeout);
                    return state.filter(alert => alert.index !== action.payload.id);
                }

                return state;

            default:
                return state;
        }
    }

    const [alerts, dispatch] = useReducer(reducer, []);

    const alertContainer = useMemo(() => {
        return <div className="alertContainer">
            {alerts.map(alert => alert.alert)}
        </div>
    }, [alerts]);

    const addAlert = useCallback((msg, time, type) => {
        dispatch({ type: "ADD_ALERT", payload: { msg: msg, time: time, type: type } })
    }, [dispatch]);

    return [alertContainer, addAlert];



}

export default useAlert;