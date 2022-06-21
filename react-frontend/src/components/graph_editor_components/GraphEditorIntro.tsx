import React from "react";
import {UnorderedList, ListItem} from "@chakra-ui/react";
import GraphCanvasNode from "./GraphCanvasNode";
import GraphCanvasEdgeSelf from "./GraphCanvasEdgeSelf";
import Xarrow from "react-xarrows";
import { colorCode } from "./GraphEditor";
import { GraphEdge, GraphNode } from "../../classes/Graph";

const sampleNode = new GraphNode("example", "dynamic", { x: 0, y: 0 });
const sampleNode1 = new GraphNode("node 1", "dynamic", { x: 130, y: 192 });
const sampleNode2 = new GraphNode("node 2", "dynamic", { x: 310, y: 192 });
const sampleSelfEdge = new GraphEdge(sampleNode, sampleNode, {
    min: 1,
    max: 1,
});

class GraphEditorIntro extends React.Component<{}, {}> {
    render() {
        return (
            <div className="Instruction">
                <UnorderedList paddingLeft={"15px"} background={"transparent"}>
                    <ListItem>
                        To place a group node, click on any empty space on the
                        left canvas.
                    </ListItem>
                    <ListItem>
                        If the node is time-dependent, click the same node twice
                        to create a self-directed edge.
                    </ListItem>
                </UnorderedList>

                <GraphCanvasNode
                    node={sampleNode}
                    key={"sp1"}
                    label={"group 1"}
                    position={{ x: 110, y: 102 }}
                    nodeRadius={20}
                    onClick={(e: any) => console.log(e)}
                    highlighted={2}
                />

                <GraphCanvasNode
                    node={sampleNode}
                    key={"sp2"}
                    label={"group 1"}
                    position={{ x: 220, y: 102 }}
                    nodeRadius={20}
                    onClick={(e: any) => console.log(e)}
                    highlighted={0}
                />

                <GraphCanvasNode
                    node={sampleNode}
                    key={"sp3"}
                    label={"group 1"}
                    position={{ x: 330, y: 102 }}
                    nodeRadius={20}
                    onClick={(e: any) => console.log(e)}
                    highlighted={1}
                />

                <GraphCanvasEdgeSelf
                    edge={sampleSelfEdge}
                    key={"sample_selfedge"}
                    label={"1:1"}
                    fromPosition={{ x: 345, y: 47 }}
                    toPosition={{ x: 335, y: 46 }}
                    onClick={(e: any) => console.log(e)}
                    highlighted={false}
                />

                <UnorderedList paddingLeft={"15px"} paddingTop={"67px"}>
                    <ListItem>
                        Click two different nodes sequentially to create an
                        edge.
                    </ListItem>
                </UnorderedList>

                <GraphCanvasNode
                    node={sampleNode1}
                    key={"sampleNode1"}
                    label={"node 1"}
                    position={sampleNode1.position}
                    nodeRadius={20}
                    onClick={(e: any) => console.log(e)}
                    highlighted={0}
                />

                <Xarrow
                    start={"node 1"}
                    end={"node 2"}
                    labels={
                        <div
                            className="EdgeText"
                            style={{
                                color: colorCode.edgeNormal,
                                backgroundColor: "white",
                                margin: "auto"
                            }}
                        >
                            1:3
                        </div>
                    }
                    curveness={0}
                    strokeWidth={2}
                    color={colorCode.edgeNormal}
                />

                <GraphCanvasNode
                    node={sampleNode2}
                    key={"sampleNode2"}
                    label={"node 2"}
                    position={sampleNode2.position}
                    nodeRadius={20}
                    onClick={(e: any) => console.log(e)}
                    highlighted={1}
                />

                <UnorderedList paddingLeft={"15px"} paddingTop={"65px"}>
                    <ListItem>
                        Click the group on the left panel to view all members
                        within a group.
                    </ListItem>
                    <ListItem>
                        The edges for members can be created the same way as the
                        groups on the left panel.
                    </ListItem>
                    <ListItem>
                        Don't forget press "Confirm Graph" below once you finish updating your graph.
                    </ListItem>
                </UnorderedList>
            </div>
        );
    }
}

export default GraphEditorIntro;
