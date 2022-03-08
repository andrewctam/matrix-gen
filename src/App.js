import React from 'react';
import MatrixEditor from './matrix/MatrixEditor.js';
import Selectors from "./matrix/saving/Selectors.js"
class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selection: "A", 
            matrices: {"A": [["", ""], ["", ""]]}   
        }
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
                    renameMatrix = {this.renameMatrix}
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

    copyMatrix = (toCopy, name) => {
        var temp = this.state.matrices;
        temp[name] = temp[toCopy].map(function(arr) { return arr.slice(); });
        this.setState({matrices: temp});
    }

    addMatrix = () => {
        var temp = this.state.matrices;
        var name = "A";
        var charCode = 65;

        while (name in temp) {
            if (name.charAt(name.length - 1) === "Z") {
                name += "A"
                charCode = 65;
            }
            else
                name = name.substring(0, name.length - 1) + String.fromCharCode(++charCode);
        }


        temp[name] = [["", ""], ["", ""]];
        this.setState({matrices: temp});
    }


    

}

export default App;
