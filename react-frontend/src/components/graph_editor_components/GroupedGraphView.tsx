import React from "react";
import {
    GroupedGraph,
    GroupedGraphNode,
    GroupedGraphEdge,
} from "../../classes/GroupedGraph";
import GraphCanvas from "./GraphCanvas";
import { Position } from "./geometry";

interface GroupedGraphViewProps {
    groupedGraph: GroupedGraph;
    selectedGroup: (GroupedGraphNode | null)[];
    selectedGroupEdge: GroupedGraphEdge | null;
    nodeRadius: number;
    onEmptyLocationClick: Function;
    onNodeClick: Function;
    onEdgeClick: Function;
}

class GroupedGraphView extends React.Component<GroupedGraphViewProps, {}> {
    constructor(props: GroupedGraphViewProps) {
        super(props);
        this.handleEmptyLocationClick =
            this.handleEmptyLocationClick.bind(this);
        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.handleEdgeClick = this.handleEdgeClick.bind(this);
    }

    handleEmptyLocationClick(position: Position) {
        this.props.onEmptyLocationClick(position);
    }

    handleNodeClick(node: GroupedGraphNode) {
        this.props.onNodeClick(node);
    }

    handleEdgeClick(edge: GroupedGraphEdge) {
        this.props.onEdgeClick(edge);
    }

    render() {
        return (
            <div className="GroupedGraphView">
                <GraphCanvas
                    title={""}
                    graph={this.props.groupedGraph}
                    selectedNode={this.props.selectedGroup}
                    selectedEdge={this.props.selectedGroupEdge}
                    nodeRadius={this.props.nodeRadius}
                    onEmptyLocationClick={this.handleEmptyLocationClick}
                    onNodeClick={this.handleNodeClick}
                    onEdgeClick={this.handleEdgeClick}
                />
            </div>
        );
    }
}

export default GroupedGraphView;
