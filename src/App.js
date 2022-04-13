import React from 'react';
import MatrixEditor from './editor/MatrixEditor.js';
import Selectors from "./selectors/Selectors.js"

export const MaxMatrixSize = React.createContext(50);

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mirror: false,
            sparseVal: "0",
            selection: "A", 
            matrices: {"A": [["", ""], ["", ""]]}   
        }
    }


    render() {

        if (this.state.selection in this.state.matrices)
            var editor = <MatrixEditor
                matrix = {this.state.matrices[this.state.selection]} 
                matrices = {this.state.matrices}
                name = {this.state.selection} 
                updateMatrix = {this.updateMatrix}
                updateParameter = {this.updateParameter}
                mirror = {this.state.mirror}
                sparseVal = {this.state.sparseVal}
                addMatrix = {this.addMatrix}
                />
        else
            editor = null;


        return (
            <div> 

                <div class = "sticky-top">
                <Selectors matrices = {this.state.matrices} 
                    updateSelection = {this.updateSelection} 
                    addMatrix = {this.addMatrix}
                    deleteMatrix = {this.deleteMatrix}
                    renameMatrix = {this.renameMatrix}
                    copyMatrix = {this.copyMatrix}
                    selection = {this.state.selection}
                    updateMatrix = {this.updateMatrix}
                    resizeMatrix = {this.resizeMatrix}
                    updateParameter = {this.updateParameter}/>
                    </div>

                    {editor} 
                <button onClick={this.saveMatricesToLocalStorage}>Save</button>

            </div>
        )
    }
    
    updateMatrix = (updated, key) => {
        var temp = this.state.matrices;
        temp[key] = updated;

        this.setState({matrices: temp});
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

    
    copyMatrix = (toCopy, name = undefined) => {
        var temp = this.state.matrices;
        var matrixName;
        if (name === undefined) {
            matrixName = this.generateUniqueName();
        } else {
            matrixName = name;
        }



        temp[matrixName] = temp[toCopy].map(function(arr) { return arr.slice(); });
        this.setState({matrices: temp});
    }

    generateUniqueName = () => {
        var charCode = 65;
        var matrixName = "A";
        while (matrixName in this.state.matrices) {
            //if (name.charAt(name.length - 1) === "Z") {
            if (charCode === 90) { 
                matrixName += "A"
                charCode = 65;
            }
            else 
                matrixName = matrixName.substring(0, matrixName.length - 1) + String.fromCharCode(++charCode);
        }

        return matrixName
    }

    addMatrix = (matrix = undefined, name = undefined) => {
        var temp = this.state.matrices;
        var matrixName;
        if (name === undefined) {
            matrixName = this.generateUniqueName();
        } else {
            matrixName = name;
        }
        
        if (matrix === undefined) {
            temp[matrixName] = [["", ""], ["", ""]];
        } else {
            temp[matrixName] = matrix;
        }
        
        
        this.setState({matrices: temp, selection: matrixName}, () => {
            var selectors = document.getElementById("selectors");
            selectors.scrollTop = selectors.scrollHeight;
        });

        

    }

    deleteMatrix = (del) => {        
        var temp = this.state.matrices;
        delete temp[del];
        this.setState({matrices: temp});
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
        if (this.state.matrices[name].length !== rows || this.state.matrices[name][0].length !== cols) {
            if (rows > 51)
                rows = 51
            if (cols > 51)
                cols = 51

            var lessRows = Math.min(rows, this.state.matrices[name].length)
            var lessCols = Math.min(cols, this.state.matrices[name][0].length)


            var resized = Array(rows).fill([])
            for (var i = 0; i < lessRows - 1; i++) {            
                var arr = Array(cols).fill("")
                for (var j = 0; j < lessCols - 1; j++) {
                    arr[j] = this.state.matrices[name][i][j]
                }

                for (j = lessCols - 1; j < cols; j++) {
                    arr[j] = "";
                }
                
                resized[i] = arr;
            }

            
            for (i = lessRows - 1; i < rows; i++) 
                resized[i] = Array(cols).fill("");


            this.updateMatrix(resized, name); 
        }
    }

    deleteMany = () => {
        var toDelete = window.prompt("Enter matrices to delete: (For example: \"A B C\")").split(" ");

        for (var i = 0; i < toDelete.length; i++) {
            this.deleteMatrix(toDelete[i]);
        }
    }

    saveMatricesToLocalStorage = () => {
        var names = "";
        var matrixString = "";
        for (const [name, matrix] of Object.entries(this.props.matrices)) {
            names += name + ",";
            for (var i = 0; i < matrix.length; i++) {                
                for (var j = 0; j < matrix[0].length; j++)
                    matrixString += matrix[i][j] + ",";

                if (i != matrix.length - 1)
                    matrixString += "]";
            }
                
            window.localStorage.setItem(name, matrixString);
        }

        window.localStorage.setItem("names", names)
          
    }


}

export default App;
