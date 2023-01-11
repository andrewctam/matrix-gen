import React, { createContext } from 'react';
import MatrixGenerator from './matrixgenerator/MatrixGenerator';
import useAlert, { AddAlert } from '../hooks/useAlert';
import TopBar from './TopBar';

export const AlertContext = createContext<AddAlert>( () => {});

const App = () => {
    const [alerts, addAlert] = useAlert();
    
    return (
        <AlertContext.Provider value = {addAlert}> 
            {alerts}
            <TopBar />
            <MatrixGenerator />
        </AlertContext.Provider>);
}

export default App;
