import React from "react";
import { Position } from "./geometry";
import { GroupedGraphNode } from "../../classes/GroupedGraph";
import { GraphNode } from "../../classes/Graph";
import { colorCode} from "./GraphEditor"
// import Draggable from "react-draggable";

interface GraphCanvasNodeProps {
    node: GroupedGraphNode | GraphNode;
    label: string;
    position: Position;
    nodeRadius: number;
    onClick: Function;
    highlighted: number;
}

class GraphCanvasNode extends React.Component<GraphCanvasNodeProps, {}> {
    constructor(props: GraphCanvasNodeProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.onClick(this.props.node);
    }

    render() {
        let style: { [key: string]: any } = {
            left: this.props.position.x - this.props.nodeRadius,
            top: this.props.position.y - this.props.nodeRadius,
            textAlign: "center",
        };

        if (this.props.highlighted  === 0) {
            style["backgroundColor"] = colorCode.highlight1;
        } else if (this.props.highlighted  === 1) {
            style["backgroundColor"] = colorCode.highlight2;
        }

        return (
            <div
                id={this.props.label}
                className="GraphCanvasNode"
                style={style}
                onClick={this.handleClick}
            >
                <p className="NodeText"> {this.props.label} </p>
            </div>
        );
    }
}

export default GraphCanvasNode;
