import React from 'react';

class SelectorButton extends React.Component {
    constructor(props) {
        super(props);
        var size = (this.props.matrices[this.props.name].length - 1) + " x " +
            (this.props.matrices[this.props.name][0].length - 1)

        this.state = {displayName: this.props.name, displaySize: size}

    }
    render() {
        if (document.activeElement === document.getElementById("size " + this.props.name)) {
            var size = this.state.displaySize
        }
        else {
            size = (this.props.matrices[this.props.name].length - 1) + " x " +
                (this.props.matrices[this.props.name][0].length - 1)
        }


        return <button type="button" 
            class={"list-group-item list-group-item-action" + ((this.props.active) ? " active" : "")}
            onClick = {this.updateSelection}>

            <input type = "text" value = {this.state.displayName} id = {this.props.name}
            onChange = {this.renameMatrix}
            onKeyDown = {this.handleKeyDown}
            onBlur = {this.pushNewName}
            onFocus = {this.handleFocus}
            />

            <input className = "sizeInfo" id = {"size " + this.props.name}
            value = {size} 
            onChange = {this.resizeMatrix}
            onBlur = {this.pushNewSize}
            onFocusCapture = {this.handleFocus}
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

    handleFocus = (e) => {
        var rows = this.props.matrices[this.props.name].length - 1
        var cols = this.props.matrices[this.props.name][0].length - 1

        this.setState({displaySize: (rows) + " x " + cols});
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
        } else {
            var rows = this.props.matrices[this.props.name].length - 1
            var cols = this.props.matrices[this.props.name][0].length - 1

            this.setState({displaySize: (rows) + " x " + cols});
        }
    }

    handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.target.blur();
        }
    }

    



}

export default SelectorButton;