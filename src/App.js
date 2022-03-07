import React from 'react';
import MatrixEditor from './matrix/MatrixEditor.js';
import Selectors from "./matrix/saving/Selectors.js"
class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selection: "Untitled", 
            matrices: {"Untitled": [["", ""], ["", ""]]}   
        }
        this.copyMatrix("Untitled")
    }


    render() {
        if (this.state.selection in this.state.matrices)
            var editor = <MatrixEditor
                matrix = {this.state.matrices[this.state.selection]} 
                name = {this.state.selection} 
                updateMatrix = {this.updateMatrix}/>
        else
            editor = null;


        return (
            <div> 
                <Selectors matrices = {this.state.matrices} 
                    updateSelection = {this.updateSelection} 
                    addMatrix = {this.addMatrix}
                    selection = {this.state.selection}/>
                    
                {editor} 
            </div>
        )
    }
    
    updateMatrix = (updated, key) => {
        var temp = this.state.matrices;
        temp[key] = updated;

        this.setState({matrices: temp});
        console.log(this.state.matrices)
    }
    
    updateSelection = (selected) => {
        this.setState({selection: selected})
    }

    renameMatrix = (oldName, newName) => {        
        var temp = this.state.matrices;
        if (newName in temp)
            return false;

        temp[newName] = temp[oldName];
        delete temp[oldName];

        this.setState({matrices: temp});
        return true;
    }

    copyMatrix = (toCopy) => {
        var temp = this.state.matrices;
        var num = 1;

        while ("Copy " + num + " of " + toCopy in temp)
            num += 1;


        temp["Copy " + num + " of " + toCopy] = temp[toCopy].map(function(arr) { return arr.slice(); });
        this.setState({matrices: temp});
    }

    addMatrix = () => {
        var temp = this.state.matrices;
        var num = 1;

        while ("Untitled " + num in temp)
            num += 1;

        temp["Untitled " + num] = [["", ""], ["", ""]];
        this.setState({matrices: temp});
    }


    

}

export default App;
