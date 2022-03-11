import React from 'react';
import ParameterSwitchInput from '../inputs/ParameterSwitchInput';
import ParameterTextInput from '../inputs/ParameterTextInput';
import SelectorButton from './SelectorButton';

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
            <div class = "col-sm-4">
                <div id = "selectors" class="list-group">
                    {selectors}    
                </div>
            </div>
            <div class = "col-sm-4">
                <ul>
                    <li>Click on a Matrix's name to rename it. Valid characters are uppercase and lowercase letters, and underscores.</li>
                    <li>Type in a pink box Click on a Matrix's dimensions to resize it. The maximum size is 50 x 50.</li>
                </ul>   
            </div>
            <div class = "col-sm-4">
                <ul>

                    <li>Interpret empty elements (excluding pink boxes) as &nbsp;
                    <ParameterTextInput width = {"30px"} defaultVal = {"0"} id={"sparse"} updateParameter={this.props.updateParameter}/> </li>
                    <li><ParameterSwitchInput defaultVal = {false} name={"mirror"} text = {"Mirror along Diagonal"} updateParameter={this.props.updateParameter}/></li>
                </ul>   
            </div>
        </div>
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
