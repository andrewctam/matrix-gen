import { buildQueries } from '@testing-library/react';
import React from 'react';
import ParameterSwitchInput from './matrix/inputs/ParameterSwitchInput';
import ParameterTextInput from './matrix/inputs/ParameterTextInput';

class Selectors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {sort: false};
    }
    render() {

        var selectors = []
        for (var matrixName in this.props.matrices)
            selectors.push(<SelectorButton 
                name = {matrixName}
                key = {matrixName}
                updateSelection = {this.props.updateSelection}
                renameMatrix = {this.props.renameMatrix}
                resizeMatrix = {this.props.resizeMatrix}
                active = {this.props.selection === matrixName}
                matrices = {this.props.matrices}/>
        )

        if (this.state.sort) {
            var current, i, j;
            for (i = 1; i < selectors.length; i++) {
                current = selectors[i]
                if (current.props.name.toUpperCase() < selectors[i - 1].props.name.toUpperCase()) {
                    for (j = i - 1; j >= 0; j--) {
                        if (current.props.name < selectors[j].props.name)
                            selectors[j + 1] = selectors[j]
                        else
                            break;
                    }

                    selectors[j + 1] = current;
                }
            }
        }

        selectors.push(<AddButton key = " add " addMatrix = {this.props.addMatrix} />)

                
        return  <div class = "row">
            <div class = "col-sm-3">
                <div id = "selectors" class="list-group">
                    {selectors}    
                </div>
            </div>
            <div class = "col-sm-3">
                <ul>
                    <li>Click on a Matrix's name to rename it. Valid characters are uppercase and lowercase letters, and underscores.</li>
                   </ul>   
            </div>
            <div class = "col-sm-6">
                <ul>

                    <li>Interpret empty elements (excluding pink boxes) as &nbsp;
                    <ParameterTextInput width = {"30px"} defaultVal = {"0"} id={"sparse"} updateParameter={this.props.updateParameter}/> </li>
                    <li><ParameterSwitchInput defaultVal = {false} name={"mirror"} text = {"Mirror along Diagonal"} updateParameter={this.props.updateParameter}/></li>
                </ul>   
            </div>
        </div>
    }


}


class SelectorButton extends React.Component {
    constructor(props) {
        super(props);
        var size = (this.props.matrices[this.props.name].length - 1) + " x " +
            (this.props.matrices[this.props.name][0].length - 1)

        this.state = {displayName: this.props.name, displaySize: size}

    }
    render() {
        return <button type="button" 
            class={"list-group-item list-group-item-action" + ((this.props.active) ? " active" : "")}
            onClick = {this.updateSelection}>
            <input type = "text" value = {this.state.displayName} id = {this.props.name}
            onChange = {this.renameMatrix}
            onKeyDown = {this.handleKeyDown}
            onBlur = {this.pushNewName}
             />
             <input className = "sizeInfo"
             value = {this.state.displaySize} 
             onChange = {this.resizeMatrix}
             onBlur = {this.pushNewSize}
             onKeyDown = {this.handleKeyDown}
             />
        </button>

    }

    updateSelection = () => {
        this.props.updateSelection(this.props.name);
    }


    renameMatrix = (e) => {
        var updated = e.target.value;
        if (/^[A-Za-z_]*$/.test(updated)) {
           this.setState({displayName: updated})
        }

    }

    resizeMatrix = (e) => {
        var updated = e.target.value;

        if (/^[0-9 \s]*[x]?[0-9 \s]*$/.test(updated)) {
            this.setState({displaySize: updated})
        }
    }

    pushNewName = () => {
        if (this.state.displayName !== this.props.name)
            if (this.state.displayName === "") {
                alert("The name can not be blank!")
                this.setState({displayName: this.props.name})
            }
            else if (this.state.displayName in this.props.matrices) {
                alert("The name " + this.state.displayName + " already exists!")
                
                this.setState({displayName: this.props.name})
            } else {
                console.log("a")
                this.props.renameMatrix(this.props.name, this.state.displayName)
                this.props.updateSelection(this.state.displayName)
            }
    }

    pushNewSize = () => {   
        if (/[0-9]* ?x ?[0-9]*/.test(this.state.displaySize)) {
            var rows = parseInt(this.state.displaySize.substring(0, this.state.displaySize.indexOf("x")));
            var cols = parseInt(this.state.displaySize.substring(this.state.displaySize.indexOf("x") + 1));
            
            if (rows > 0 && cols > 0) {
                this.setState({displaySize: (rows) + " x " + cols});
                this.props.resizeMatrix(this.props.name, rows + 1, cols + 1);
            } else {
                alert("Dimensions can not be zero");
                var rows = this.props.matrices[this.props.name].length - 1
                var cols = this.props.matrices[this.props.name][0].length - 1

                this.setState({displaySize: (rows) + " x " + cols});
            }
            
        }
    }

    handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.target.blur();
        }
    }

    



}

class AddButton extends React.Component {
    render() {
        return <button type="button" 
            class={"list-group-item list-group-item-info"}
            onClick = {this.addMatrix}>
            New Matrix
        </button>
    }

    addMatrix = () => {
        this.props.addMatrix();   
    }
}

export default Selectors;
