import react from "react";
class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = ({verticies: [], edges: [], matrixType: "adjacency"})
    }

    parseMatrix() {
        switch (this.state.matrix) {
            case "adjacency":
                
        }        
    }
}

export default Graph;