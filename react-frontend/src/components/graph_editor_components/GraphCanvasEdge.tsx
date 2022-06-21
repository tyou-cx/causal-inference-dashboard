import React from "react";
import { Position } from "./geometry";
import { GroupedGraphEdge } from "../../classes/GroupedGraph";
import { GraphEdge } from "../../classes/Graph";
import Xarrow from "react-xarrows";
import { colorCode } from "./GraphEditor";

interface GraphCanvasEdgeProps {
    edge: GroupedGraphEdge | GraphEdge;
    label: string;
    fromPosition: Position;
    toPosition: Position;
    onClick: Function;
    highlighted: boolean;
}

class GraphCanvasEdge extends React.Component<GraphCanvasEdgeProps, {}> {
    constructor(props: GraphCanvasEdgeProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.getID = this.getID.bind(this);
        this.getLabel = this.getLabel.bind(this);
    }

    handleClick() {
        this.props.onClick(this.props.edge);
    }

    getID() {
        return (
            "_edge_" +
            this.props.edge.from_node.name +
            "_" +
            this.props.edge.to_node.name
        );
    }

    getLabel() {
        let color_update = colorCode.edgeNormal;
        if (this.props.highlighted) {
            color_update = colorCode.highlight2;
        }
        return (
            <div
                className="EdgeText"
                style={{ color: color_update, backgroundColor: "white" }}
                onClick={this.handleClick}
            >
                {this.props.label}
            </div>
        );
    }

    render() {
        let color_update = colorCode.edgeNormal;
        if (this.props.highlighted) {
            color_update = colorCode.highlight2;
        }

        // the text on edges are oriented according to the line:
        // so if either x2 or y2 are less than x1 or y1 respectively, the text is "reverse" oriented
        // but if x2 > x1, or y2>y1, then text appears "normally"
        return (
            <div className="GraphCanvasEdge" id={this.getID()}>
                <Xarrow
                    start={this.props.edge.from_node.name}
                    end={this.props.edge.to_node.name}
                    startAnchor={{
                        position: "middle",
                        offset: {
                            x: this.props.fromPosition.x,
                            y: this.props.fromPosition.y,
                        },
                    }}
                    endAnchor={{
                        position: "middle",
                        offset: {
                            x: this.props.toPosition.x,
                            y: this.props.toPosition.y,
                        },
                    }}
                    curveness={0}
                    labels={this.getLabel()}
                    strokeWidth={2}
                    color={color_update}
                    passProps={{ onClick: this.handleClick }}
                />
            </div>
        );
    }
}

export default GraphCanvasEdge;
