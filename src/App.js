import React from 'react';
import MatrixEditor from './editor/MatrixEditor.js';
import Selectors from "./selectors/Selectors.js"

export const MaxMatrixSize = React.createContext(50);

class App extends React.Component {

    constructor(props) {
        super(props);
        
        try {
            this.loadFromLocalStorage();
        } catch (error) {
            this.state = {
                autoSave: false,
                mirror: false,
                sparseVal: "0",
                selection: "A", 
                matrices: {"A": [["", ""], ["", ""]]}   
            }
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
                <Selectors matrices = {this.state.matrices} 
                    updateSelection = {this.updateSelection} 
                    addMatrix = {this.addMatrix}
                    deleteMatrix = {this.deleteMatrix}
                    renameMatrix = {this.renameMatrix}
                    copyMatrix = {this.copyMatrix}
                    selection = {this.state.selection}
                    updateMatrix = {this.updateMatrix}
                    resizeMatrix = {this.resizeMatrix}
                    updateParameter = {this.updateParameter}
                    saveToLocalStorage = {this.saveToLocalStorage}
                    clearMatrices = {this.clearMatrices}

                    autoSave = {this.state.autoSave}
                    mirror = {this.state.mirror}
                    sparseVal = {this.state.sparseVal}
                />

                {editor} 
            </div>
        )
    }
    
    updateMatrix = (updated, key) => {
        var temp = this.state.matrices;
        temp[key] = updated;

        this.setState({matrices: temp}, () => {
            if (this.state.autoSave)
            this.saveToLocalStorage();
        });
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

        this.setState({matrices: temp}, () => {
            if (this.state.autoSave)
            this.saveToLocalStorage();
        });

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

        this.setState({matrices: temp}, () => {
            if (this.state.autoSave)
                this.saveToLocalStorage();
        });
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

        return matrixName;
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

            if (this.state.autoSave)
                this.saveToLocalStorage();
        });

        
        

    }

    deleteMatrix = (del) => {        
        var temp = this.state.matrices;
        delete temp[del];
        this.setState({matrices: temp}, () => {
            if (this.state.autoSave)
            this.saveToLocalStorage();
        });

        
    }

    updateParameter = (i, updated) => {
        switch (i) {
            case "sparse":
                this.setState({sparseVal: updated})
                if (this.state.autoSave)
                    window.localStorage.setItem("sparseValue;", updated); 
                break;
            case "mirror":
                this.setState({mirror: updated});  
                if (this.state.autoSave)
                    window.localStorage.setItem("mirror;", updated ? "1" : "0");
                break; 

            case "autoSave":
                this.setState({autoSave: updated});

                if (updated /* === true*/)
                    this.saveToLocalStorage()
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


    clearMatrices = () => {
        if (window.confirm("Clear all matrices?")) {
            this.setState({ 
                selection: "", 
                matrices: {}
            });

            if (this.state.autoSave)
                localStorage.clear();
        }

    }

    saveToLocalStorage = () => {
        var names = "";
        var matrixString = "";
        for (const [name, matrix] of Object.entries(this.state.matrices)) {
            matrixString = "";
            names += name + ",";
            
            for (var i = 0; i < matrix.length - 1; i++) {                
                for (var j = 0; j < matrix[0].length - 1; j++) {
                    matrixString += matrix[i][j];
                    if (j != matrix[0].length - 2)
                        matrixString += ","
                }

                if (i != matrix.length - 2)
                    matrixString += "]";
            }
                
            
            window.localStorage.setItem(name, matrixString);
        }

        window.localStorage.setItem("names;", names.substring(0, names.length - 1))
        window.localStorage.setItem("mirror;", this.state.mirror ? "1" : "0")
        window.localStorage.setItem("autoSave;", this.state.autoSave ? "1" : "0")
        window.localStorage.setItem("sparseValue;", this.state.sparseVal)
    }




    loadFromLocalStorage = () => {
        var names = localStorage.getItem("names;")
        names = names.split(",")
        var matrices = {}

        var matrix;
        for (const n of names) {
            matrix = localStorage.getItem(n);
            matrix = matrix.split("]")
            for (var i = 0; i < matrix.length; i++) {
                matrix[i] = matrix[i].split(",")
                matrix[i].push("");
            }

            matrix.push(new Array(matrix[0].length).fill(""));


        
            console.log(matrix)
            matrices[n] = matrix
        }


        console.log(matrices)
        this.state = {
            matrices: matrices, 
            autoSave: window.localStorage.getItem("autoSave;") === "1",
            mirror: window.localStorage.getItem("mirror;") === "1",
            sparseVal: window.localStorage.getItem("sparseValue;"),
            selection: names[0], 

        };


    }


}

export default App;
