import React from 'react';

class Selectors extends React.Component {
    render() {
        var selectors = []
        for (var matrixName in this.props.matrices)
            selectors.push(<SelectorButton name = {matrixName}
                updateSelection = {this.props.updateSelection}
                active = {this.props.selection === matrixName}/>
        )

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

        selectors.push(<AddButton addMatrix = {this.props.addMatrix} />)

                
        return <div class="list-group">
            {selectors}
        </div>
    }

}


class SelectorButton extends React.Component {
    render() {
        return <button type="button" 
            class={"list-group-item list-group-item-action" + ((this.props.active) ? " active" : "")}
            onClick = {this.updateSelection}>
            {this.props.name}
        </button>

    }

    updateSelection = () => {
        this.props.updateSelection(this.props.name);
    }
}

class AddButton extends React.Component {
    render() {
        return <button type="button" 
            class={"list-group-item list-group-item-action"}
            onClick = {this.addMatrix}>
            New Matrix
        </button>

    }

    addMatrix = () => {
        this.props.addMatrix();
    }
}

export default Selectors;
