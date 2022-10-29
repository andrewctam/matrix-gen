import { useCallback, useMemo, useReducer } from "react";



const useAlert = () => {
    const createAlert = ((msg, id, time, type = "success") => {
        const timeout = setTimeout(() => {
            dispatch({ type: "REMOVE_ALERT", payload: { "id": id } })
        }, time)

        const alert = (
            <div
                key={`alert${id}`}
                className={`alert ${type === "error" ? "error-alert" : "normal-alert"}`}
                onClick={() => {
                    dispatch({ type: "REMOVE_ALERT", payload: { "id": id } })
                }}>

                <p>{msg}</p>
            </div>
        )


        return {
            index: id,
            alert: alert,
            timeout: timeout
        };

    })

    const reducer = (state, action) => {
        switch (action.type) {
            case "ADD_ALERT":
                return [...state, createAlert(action.payload.msg, state.length, action.payload.time, action.payload.type)];

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