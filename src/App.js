import React from 'react';
import MatrixEditor from './MatrixEditor.js';

class App extends React.Component {

    render() {
        return (
        <div>
            <h1>Quickly generate matrices for programming or LaTeX. Start entering your matrix below and the resulting 2D array will appear below the matrix. The pink row and column will be ignored from the output matrix, and typing in one of them will create a new row or column. Use the arrow keys or Tab to quickly navigate the matrix.</h1>
            <MatrixEditor />
        </div>)
    }
}

export default App;
