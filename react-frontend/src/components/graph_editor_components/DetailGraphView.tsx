import React from "react";
import { Graph, GraphNode, GraphEdge } from "../../classes/Graph";
import { GroupedGraphNode } from "../../classes/GroupedGraph";
import GraphCanvas from "./GraphCanvas";
import { Position } from "./geometry";

interface DetailGraphViewProps {
    group: GroupedGraphNode;
    selectedNode: (GraphNode | null)[];
    selectedDetailEdge: GraphEdge | null;
    graph: Graph;
    nodeRadius: number;
    onEmptyLocationClick: Function;
    onNodeClick: Function;
    onEdgeClick: Function;
}

class DetailGraphView extends React.Component<DetailGraphViewProps, {}> {
    constructor(props: DetailGraphViewProps) {
        super(props);
        this.handleEmptyLocationClick =
            this.handleEmptyLocationClick.bind(this);
        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.handleEdgeClick = this.handleEdgeClick.bind(this);
    }

    handleEmptyLocationClick(position: Position) {
        this.props.onEmptyLocationClick(position);
    }

    handleNodeClick(node: GraphNode) {
        this.props.onNodeClick(node);
    }

    handleEdgeClick(edge: GraphEdge) {
        this.props.onEdgeClick(edge);
    }

    render() {
        // Set title
        const title = this.props.group
            ? `Group: ${this.props.group.name || ""}`
            : "";

        return (
            <div className="DetailGraphView">
                <GraphCanvas
                    title = {title}
                    graph={this.props.graph}
                    selectedNode={this.props.selectedNode}
                    selectedEdge={this.props.selectedDetailEdge}
                    nodeRadius={this.props.nodeRadius}
                    onEmptyLocationClick={this.handleEmptyLocationClick}
                    onNodeClick={this.handleNodeClick}
                    onEdgeClick={this.handleEdgeClick}
                />
            </div>
        );
    }
}

export default DetailGraphView;

// import {Graph, GraphNode, GraphEdge} from "../classes/Graph";
// import React, { MouseEventHandler } from "react";
// import "./GraphEditor.css";

// class GraphEditor extends React.Component<{},{graph: Graph}> {
//     // The state is the CausalGraph, as well as the physical positions of the nodes.
//     constructor(props: {}) {
//         super(props);
//         this.state = {graph: new Graph()};
//         this.handleClick = this.handleClick.bind(this);
//     }

//     handleClick(e: any) {
//         console.log(this.state.graph)
//         // make sure we aren't placing a node on top of another node
//         if (!this.clickedOnNode(e)) {
//             let rect = e.target.getBoundingClientRect();

//             let name = prompt('Enter node name:') || "node";

//             this.setState({graph: this.state.graph.addNode(
//                 new GraphNode(name, {x: e.clientX - rect.left, y: e.clientY - rect.top})
//                 )});
//         }
//     }

//     clickedOnNode(e: any) {
//         return (e.target.classList[0] == 'GraphEditorNode');
//     }

//     render() {
//         return (
//             <div className="GraphEditor">
//                 <h3>Define the Detailed Graph (for a Group)</h3>
//             <div className="GraphCanvas" onClick={this.handleClick}>
//                 {this.state.graph.nodes.map(
//                     node => <GraphEditorNode name={node.name} x={node.position.x} y={node.position.y}/>
//                 )}
//             </div>
//             </div>
//         )
//     }
// }

// class GraphEditorNode extends React.Component<{name: string, x: number, y: number},{}> {
//     constructor(props: {name: string, x: number, y: number}) {
//         super(props);
//     }

//     render() {
//         return (
//             <div className="GraphEditorNode" style={{left: this.props.x,
//                                                      top: this.props.y,
//                                                      textAlign: "center",}}>
//                 {this.props.name}
//             </div>
//         )
//     }
// }

// export default GraphEditor;
