import React from 'react';

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {matrix: [["", ""], ["", ""]], sparseVal: "0"}
    }
    matrixToString() {
        var start = "{";
        var end = "}";
        var result = start.toString();

        for (var i = 0; i < this.state.matrix.length - 1; i++) {
            result += start;
            
            for (var j = 0; j < this.state.matrix[0].length - 1; j++) {
                if (this.state.matrix[i][j] !== "")
                    result += this.state.matrix[i][j];
                else
                    result += this.state.sparseVal;
                    
                if (j !== this.state.matrix[0].length - 2) {
                    result += ","
                }
            }
            
            result += end;
            if (i != this.state.matrix.length - 2) {
                result += ","
            }

        }
        return result + end;

    }
    render() {
        var matrixTable = this.state.matrix.map((x, i) => <Row  rows = {this.state.matrix[0].length} 
                                                                cols = {this.state.matrix.length}
                                                                addRows = {this.addRows} 
                                                                addCols = {this.addCols} 
                                                                updateEntry = {this.updateEntry}
                                                                boxes={x} col = {i} />)
        return (
        <div>
            <table className = "table table-bordered table-hover" >
                <tbody>
                    {matrixTable}
                </tbody>
            </table>
        <input className="output" value = {this.matrixToString(this.state.matrix)} />
        <p>Interpret empty entires (excluding last row and column) as <ParameterInput defaultVal = {0} id={0} updateParameter={this.updateParameter}/></p>
        </div>)
    }

    updateEntry = (i, j, val) => {
        var temp = this.state.matrix;
        temp[i][j] = val;

        this.setState({matrix: temp, sparseVal: this.state.sparseVal});        
    }
    
    addRows = (num) => {
        var temp = this.state.matrix;
        for (var i = 0; i < temp.length; i++) {
            for (var j = 0; j < num; j++)
                temp[i].push("")
        }

        this.setState({matrix: temp, sparseVal: this.state.sparseVal});  
    }

    addCols = (num) => {
        var emptyCol = [];
        for (var i = 0; i < this.state.matrix[0].length; i++) {
            emptyCol.push("");
        }

        var temp = this.state.matrix;
        for (var i = 0; i < num; i++) {
            temp.push(emptyCol)
        }

        this.setState({matrix: temp, sparseVal: this.state.sparseVal});  
    }

    updateParameter = (i, updated) => {
        switch (i) {
            case 0:
                this.setState({matrix: this.state.matrix, sparseVal: updated});  
                break;
                
            default: break;
  
        }
    }
}

class Row extends React.Component {
    render() {
        return <tr>{this.props.boxes.map((x, i) => <Box addRows = {this.props.addRows} 
                                                    addCols = {this.props.addCols}
                                                    rows = {this.props.rows}
                                                    cols = {this.props.cols}
                                                    updateEntry = {this.props. updateEntry} 
                                                    num={x} 
                                                    col = {this.props.col} 
                                                    row = {i} />)}</tr>
    }
}

class Box extends React.Component {
    render() {
        if (this.props.cols === (this.props.col + 1) && this.props.rows === (this.props.row + 1))
            return <td><input id = {this.props.row + ":" + this.props.col} 
            onChange = {this.handleAddBoth} value={this.props.num} /></td>

        if (this.props.cols === (this.props.col + 1))
            return <td><input id = {this.props.row + ":" + this.props.col} 
            onChange = {this.handleAddCol} value={this.props.num} /></td>


        if (this.props.rows === (this.props.row + 1))
            return <td><input id = {this.props.row + ":" + this.props.col} 
            onChange = {this.handleAddRow} value={this.props.num} /></td>

        else
            return <td><input id = {this.props.row + ":" + this.props.col} 
            onChange = {this.handleChange} value={this.props.num} /></td>


    }

    handleChange = (e) => {
        this.props.updateEntry(this.props.col, this.props.row, e.target.value);
    }

    handleAddRow = (e) => {
        this.props.addRows(1);
        this.props.updateEntry(this.props.col, this.props.row, e.target.value);

    }

    handleAddCol = (e) => {
        this.props.addCols(1);
        this.props.updateEntry(this.props.col, this.props.row, e.target.value);

    }

    handleAddBoth = (e) => {
        this.props.addCols(1);
        this.props.addRows(1);
        this.props.updateEntry(this.props.col, this.props.row, e.target.value);

    }

}

class ParameterInput extends React.Component {
    render() {
        return <input value = {this.props.defaultVal} onChange = {this.handleChange}></input>
    }

    handleChange = (e) => {
        this.props.updateParameter(this.props.id, e.target.value)
    }
}


export default App;
