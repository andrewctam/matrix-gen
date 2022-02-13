import React from 'react';
import MatrixEditor from './matrix/MatrixEditor.js';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {matrix: []}
    }


    render() {
        return (
        <div>
            <MatrixEditor/>
        </div>
        )
    }
}

export default App;
