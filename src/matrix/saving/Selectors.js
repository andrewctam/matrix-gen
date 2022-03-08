import React from 'react';

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
                active = {this.props.selection === matrixName}
                matrices = {this.props.matrices}/>
        )

        if (this.state.sort) {
            var current, i, j;
            for (i = 1; i < selectors.length; i++) {
                current = selectors[i]
                if (current.props.name.toUpperCase() < selectors[i - 1].props.name.toUpperCase()) {
                    for (j = i - 1; j >= 0; j--) {
                        if (current.props.name.toUpperCase() < selectors[j].props.name.toUpperCase())
                            selectors[j + 1] = selectors[j]
                        else
                            break;
                    }

                    selectors[j + 1] = current;
                }
            }
        }

        selectors.unshift(<AddButton key = " add " addMatrix = {this.props.addMatrix} />)

                
        return <div class="list-group">
            {selectors}
        </div>
    }


}


class SelectorButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {displayName: this.props.name}

    }
    render() {
        return <button type="button" 
            class={"list-group-item list-group-item-action" + ((this.props.active) ? " active" : "")}
            onClick = {this.updateSelection}>
            <input type = "text" value = {this.state.displayName} 
            onChange = {this.renameMatrix}
            onBlur = {this.pushNewName}
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

    pushNewName = () => {
        if (this.state.displayName !== this.props.name)
            if (this.state.displayName in this.props.matrices) {
                alert("The name " + this.state.displayName + " already exists!")
                this.setState({displayName: this.props.name})
            } else {
                console.log("a")
                this.props.renameMatrix(this.props.name, this.state.displayName)
                this.props.updateSelection(this.state.displayName)
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
