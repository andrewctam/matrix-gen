import React, { createContext } from 'react';
import MatrixGenerator from './matrixgenerator/MatrixGenerator';
import useAlert, { AddAlert } from '../hooks/useAlert';
import TopBar from './TopBar';

import useSaving from '../hooks/useSaving';
export const AlertContext = createContext<AddAlert>( () => {});

const App = () => {
    const [alerts, addAlert] = useAlert();
    const [doneLoading, refreshTokens] = useSaving(addAlert);

    if (!doneLoading)
        return null

    return (
        <AlertContext.Provider value = {addAlert}> 
            {alerts}
            <TopBar />
            <MatrixGenerator />
        </AlertContext.Provider>);

}

export default App;
