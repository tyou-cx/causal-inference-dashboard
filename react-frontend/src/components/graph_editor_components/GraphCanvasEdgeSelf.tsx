import React from "react";
import { Position } from "./geometry";
import { GroupedGraphEdge } from "../../classes/GroupedGraph";
import { GraphEdge } from "../../classes/Graph";
import { Text } from "@chakra-ui/react";
import { colorCode } from "./GraphEditor";
import zIndex from "@mui/material/styles/zIndex";

const labelOffsetX = 29;
const labelOffsetY = 35;
const OffsetXStart = 15;
const OffsetYStart = 15;
const OffsetXEnd = 9;
const OffsetYEnd = 34;

interface GraphCanvasEdgeProps {
    edge: GroupedGraphEdge | GraphEdge;
    label: string;
    fromPosition: Position;
    toPosition: Position;
    onClick: Function;
    highlighted: boolean;
}

class GraphCanvasEdgeSelf extends React.Component<GraphCanvasEdgeProps, {}> {
    constructor(props: GraphCanvasEdgeProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.getID = this.getID.bind(this);
        this.getLabel = this.getLabel.bind(this);
        this.getPath = this.getPath.bind(this);
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

    egdeOnRight = this.props.toPosition.x > 250 ? 1 : 0;
    egdeOnBottom = this.props.toPosition.y > 200 ? 0 : 0;
    multiplierLR = 2 * this.egdeOnRight - 1;
    multiplierTB = 2 * this.egdeOnBottom - 1;

    getPath() {
        const path =
            "M" +
            (this.props.fromPosition.x + this.multiplierLR * OffsetXStart) +
            " " +
            (this.props.fromPosition.y + this.multiplierTB * OffsetYStart) +
            " A14 14 0 1 " +
            (this.multiplierLR * this.multiplierTB === 1 ? "1 " : "0 ") +
            (this.props.toPosition.x + this.multiplierLR * OffsetXEnd) +
            " " +
            (this.props.toPosition.y + this.multiplierTB * OffsetYEnd);
        return path;
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
            <div style={{ position: "absolute", pointerEvents: "none" }}>
                <svg
                    className="GraphCanvasEdgeSelf"
                    width={"500px"}
                    height={"400px"}
                    style={{
                        position: "relative",
                        pointerEvents: "none",
                        //border: "1px dashed red",
                    }}
                    id={this.getID()}
                    onClick={(e) => console.log(e.target)}
                >
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9.5"
                            refY="3.5"
                            orient="auto"
                            fill={colorCode.edgeNormal}
                        >
                            <polygon points="8.3 3.5, 7.5 1.5, 10 3.5, 7.5 5.5" />
                        </marker>

                        <marker
                            id="arrowheadH"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9.5"
                            refY="3.5"
                            orient="auto"
                            fill={colorCode.highlight2}
                        >
                            <polygon points="8.5 3.5, 8 1.5, 10 3.5, 8 5.5" />
                        </marker>
                    </defs>

                    <g>
                        <path
                            style={{ position: "absolute" }}
                            className="GraphCanvasEdgeSelf"
                            d={this.getPath()}
                            stroke={color_update}
                            strokeWidth="2"
                            fill="none"
                            pointerEvents="auto"
                            markerEnd={
                                this.props.highlighted
                                    ? "url(#arrowheadH)"
                                    : "url(#arrowhead)"
                            }
                            onClick={(e) => console.log(e.target)}
                        />
                    </g>
                </svg>
                <div
                    className="GraphCanvasEdgeSelfLabel"
                    style={{
                        zIndex: 800,
                        fontSize: "12px",
                        color: color_update,
                        display: "table",
                        width: "max-content",
                        transform: "translate(-50% , -50%)",
                        position: "absolute",
                        backgroundColor: "white",
                        pointerEvents: "all",
                        left:
                            this.props.toPosition.x +
                            this.multiplierLR * labelOffsetX,
                        top:
                            this.props.toPosition.y +
                            this.multiplierTB * labelOffsetY,
                    }}
                >
                    {this.getLabel()}
                </div>
            </div>
        );
    }
}

export default GraphCanvasEdgeSelf;
