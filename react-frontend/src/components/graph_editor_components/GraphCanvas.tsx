import React from "react";
import {
    GroupedGraph,
    GroupedGraphNode,
    GroupedGraphEdge,
} from "../../classes/GroupedGraph";
import { Graph, GraphNode, GraphEdge } from "../../classes/Graph";
import { Position, computeEdgeEndpts } from "./geometry";
import GraphCanvasNode from "./GraphCanvasNode";
import GraphCanvasEdge from "./GraphCanvasEdge";
import GraphCanvasEdgeSelf from "./GraphCanvasEdgeSelf";
import {Text} from "@chakra-ui/react";

interface GraphCanvasProps {
    title: string;
    graph: GroupedGraph | Graph;
    selectedNode: (GroupedGraphNode | GraphNode | null)[];
    selectedEdge: GroupedGraphEdge | GraphEdge | null;
    nodeRadius: number;
    onEmptyLocationClick: Function;
    onNodeClick: Function;
    onEdgeClick: Function;
}

class GraphCanvas extends React.Component<GraphCanvasProps, {}> {
    constructor(props: GraphCanvasProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.handleEdgeClick = this.handleEdgeClick.bind(this);
    }

    handleClick(e: any) {
        // make sure we aren't placing a node on top of another node
        // since the whole canvas is now an svg class GraphCanvasEdge, the && statement with clickedonedge doesnt work
        console.log(e.target);
        if (e.target.classList[0] === "GraphCanvas") {
            // && !this.clickedOnEdge(e)) {
            let rect = e.target.getBoundingClientRect();
            const position_clicked = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            this.props.onEmptyLocationClick(position_clicked);
        }
    }

    handleNodeClick(node: GraphNode | GroupedGraphNode) {
        this.props.onNodeClick(node);
    }

    handleEdgeClick(edge: GraphEdge | GroupedGraphEdge) {
        this.props.onEdgeClick(edge);
    }

    clickedOnNode(e: any) {
        return (
            e.target.classList[0] === "GraphCanvasNode" ||
            e.target.classList[0] === "NodeText"
        );
    }

    clickedOnEdge(e: any) {
        return e.target.classList[0] === "EdgeText";
    }

    checkHighlight(node: GraphNode | GroupedGraphNode){
        if (!this.props.selectedNode[1]) {
            if (node === this.props.selectedNode[0]) {
                return 0
            } else {
                return -1
            }
        } else {
            if (node === this.props.selectedNode[0]) {
                return 1
            } else if (node === this.props.selectedNode[1]) {
                return 0
            } else {
                return -1
            }
        }
        
    }

    render() {
        const edges = this.props.graph.edges;
        const nodes = this.props.graph.nodes;

        return (
            <div className="GraphCanvas" onClick={this.handleClick}>
                <Text padding={'5px'} > {this.props.title} </Text>
                {edges.map((edge, idx) => {
                    // console.log('selectededge', this.props.selectedEdge)
                    const isSelfEdge = edge.from_node === edge.to_node;
                    const highlighted = edge === this.props.selectedEdge;

                    if (isSelfEdge) {
                        return (
                            <GraphCanvasEdgeSelf
                                edge={edge}
                                key={idx + "_selfedge"}
                                label={makeEdgeLabel(edge)}
                                fromPosition={edge.from_node.position}
                                toPosition={edge.to_node.position}
                                onClick={this.handleEdgeClick}
                                highlighted={highlighted}
                            />
                        );
                    } else {
                        const [from_endpt, to_endpt]: Position[] =
                            computeEdgeEndpts(
                                edge.from_node.position,
                                edge.to_node.position,
                                this.props.nodeRadius
                            );
                        return (
                            <GraphCanvasEdge
                                edge={edge}
                                key={idx}
                                label={makeEdgeLabel(edge)}
                                fromPosition={from_endpt}
                                toPosition={to_endpt}
                                onClick={this.handleEdgeClick}
                                highlighted={highlighted}
                            />
                        );
                    }
                })}

                {nodes.map((node, idx) => {
                    return (
                        <GraphCanvasNode
                            node={node}
                            key={idx}
                            label={node.name}
                            position={node.position}
                            nodeRadius={this.props.nodeRadius}
                            onClick={this.handleNodeClick}
                            highlighted={this.checkHighlight(node)}
                        />
                    );
                })}
            </div>
        );
    }
}

function makeEdgeLabel(edge: GroupedGraphEdge | GraphEdge): string {
    if (edge.isDynamic() && edge.time_to_effect) {
        return `${edge.time_to_effect.min}:${edge.time_to_effect.max}`;
    }
    return "";
}

export default GraphCanvas;
