import React from 'react';
import MatrixEditor from './matrix/MatrixEditor.js';
import Selectors from "./Selectors.js"

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            mirror: false,
            sparseVal: "0",
            selection: "A", 
            matrices: {"A": [["", ""], ["", ""]]
        
        
        }   
        }
    }


    render() {

        if (this.state.selection in this.state.matrices)
            var editor = <MatrixEditor
                matrix = {this.state.matrices[this.state.selection]} 
                name = {this.state.selection} 
                updateMatrix = {this.updateMatrix}
                updateParameter = {this.updateParameter}
                mirror = {this.state.mirror}
                />
        else
            editor = null;


        return (
            <div> 
                <Selectors matrices = {this.state.matrices} 
                    updateSelection = {this.updateSelection} 
                    addMatrix = {this.addMatrix}
                    renameMatrix = {this.renameMatrix}
                    selection = {this.state.selection}
                    updateMatrix = {this.updateMatrix}
                    resizeMatrix = {this.resizeMatrix}
                updateParameter = {this.updateParameter}/>
                    
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
            //if (name.charAt(name.length - 1) === "Z") {
            if (charCode === 90) { 
                name += "A"
                charCode = 65;
            }
            else
                name = name.substring(0, name.length - 1) + String.fromCharCode(++charCode);
        }


        temp[name] = [["", ""], ["", ""]];
        this.setState({matrices: temp}, () => {
            var selectors = document.getElementById("selectors");
            selectors.scrollTop = selectors.scrollHeight;
        });


    }

    updateParameter = (i, updated) => {
        switch (i) {
            case "sparse":
                this.setState({sparseVal: updated})
                break;
            case "mirror":
                this.setState({mirror: updated});  
                break; 
                
            default: break;
  
        }
    
    }

    resizeMatrix = (name, rows, cols) => {
        var lessRows = Math.min(rows, this.state.matrices[name].length)
        var lessCols = Math.min(cols, this.state.matrices[name][0].length)

        var resized = Array(rows).fill([])
        for (var i = 0; i < lessRows; i++) {            
            var arr = Array(cols).fill("")
            for (var j = 0; j < lessCols; j++) {
                arr[j] = this.state.matrices[name][i][j]
            }

            for (var j = lessCols; j < cols; j++) {
                arr[j] = "";
            }
            
            resized[i] = arr;
        }

        
        for (i = lessRows; i < rows; i++) 
            resized[i] = Array(cols).fill("");

        console.log(resized)
        console.log(lessCols)
        this.updateMatrix(resized, name); 
    }


}

export default App;
