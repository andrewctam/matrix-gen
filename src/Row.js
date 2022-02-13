import React from 'react';
import Box from './Box.js';


class Row extends React.Component {
    render() {
        return <tr>{this.props.boxes.map((x, i) => 
            <Box addRows = {this.props.addRows} 
            addCols = {this.props.addCols}
            tryToDelete = {this.props.tryToDelete}
            rows = {this.props.rows}
            cols = {this.props.cols}
            updateEntry = {this.props. updateEntry} 
            num ={x} 
            row = {this.props.row} 
            col = {i}
            key = {this.props.row + ":" + i}
            mirror = {this.props.mirror} />)}</tr>
    }
}
export default Row;