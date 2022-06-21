import React from "react";
import "./GraphEditor.css";
import GroupedGraphView from "./GroupedGraphView";
import GroupedNodeDialog from "./GroupedNodeDialog";
import EdgeDialog from "./EdgeDialog";
import DetailGraphView from "./DetailGraphView";
import {
    GroupedGraph,
    GroupedGraphNode,
    GroupedGraphEdge,
} from "../../classes/GroupedGraph";
import { Graph, GraphNode, GraphEdge } from "../../classes/Graph";
import { Position } from "./geometry";
import { variablesDict } from "../../App";
import postGraphToBackend from "../../communication/postGraphToBackend";
import {
    Button,
    Heading,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import GraphEditorIntro from "./GraphEditorIntro";

export const colorCode = {
    nodeNormal: "#90cdf4",
    edgeNormal: "#4A5568",
    highlight1: "#FEB2B2",
    highlight2: "#FC8181",
};

interface GraphEditorProps {
    variables: variablesDict;
    onGroupCreation: Function;
    onNodeCreation: Function;
}

interface GraphEditorState {
    // for updating the grouped graph on the left panel
    groupedGraph: GroupedGraph;
    selectedGroupCurr: GroupedGraphNode | null;
    selectedGroupPrev: GroupedGraphNode | null;
    selectedGroupEdge: GroupedGraphEdge | null;
    showGroupedNodeDialog: boolean;
    showGroupedEdgeDialog: boolean;
    showGroupedEdgeAlert: boolean;

    // for updating the detail graph on the right panel
    detailGraph: Graph | null;
    selectedNodeCurr: GraphNode | null;
    selectedNodePrev: GraphNode | null;
    selectedDetailEdge: GraphEdge | null;
    showDetailNodeDialog: boolean;
    showDetailEdgeDialog: boolean;
    showDetailEdgeAlert: boolean;

    // shared state for both graph panels
    selected_position: Position | null;
}

class GraphEditor extends React.Component<GraphEditorProps, GraphEditorState> {
    constructor(props: GraphEditorProps) {
        super(props);
        this.selectEmptyLocation = this.selectEmptyLocation.bind(this);
        this.handleGroupCreation = this.handleGroupCreation.bind(this);
        this.selectNode = this.selectNode.bind(this);
        this.handleEdgeCreation = this.handleEdgeCreation.bind(this);
        this.selectEdge = this.selectEdge.bind(this);

        this.state = {
            // grouped graph
            groupedGraph: new GroupedGraph(),
            selectedGroupCurr: null,
            selectedGroupPrev: null,
            selectedGroupEdge: null,
            showGroupedNodeDialog: false,
            showGroupedEdgeDialog: false,
            showGroupedEdgeAlert: false,

            // detail graph
            detailGraph: null,
            selectedNodeCurr: null,
            selectedNodePrev: null,
            selectedDetailEdge: null,
            showDetailNodeDialog: false,
            showDetailEdgeDialog: false,
            showDetailEdgeAlert: false,

            // shared state
            selected_position: null,
        };
    }

    selectEmptyLocation(position: Position, where: "grouped" | "detail") {
        // console.log("this is where I am:" , position);
        if (where === "grouped") {
            this.setState({
                selectedGroupCurr: null,
                selectedGroupPrev: null,
                selectedGroupEdge: null,
                showGroupedEdgeDialog: false,
                showGroupedNodeDialog: true,
                showGroupedEdgeAlert: false,
                selected_position: position,
            });
        } else if (where === "detail") {
            this.setState({
                selectedNodeCurr: null,
                selectedNodePrev: null,
                selectedDetailEdge: null,
                showDetailEdgeDialog: false,
                showDetailEdgeAlert: false,
                selected_position: position,
            });
        }
    }

    handleGroupCreation(
        group_name: string,
        group_members: Set<string>,
        mode: "dynamic" | "static"
      ) {
        if (this.state.selected_position) {
          this.props.onGroupCreation(group_name, group_members);
    
          // removed members attribute in GroupedGraphNode, added method getMembers
    
          // create new grouped node
          const new_grouped_node = new GroupedGraphNode(
            group_name,
            mode,
            this.state.selected_position
          );
    
          // add member nodes to the graph of the grouped node
          // arrange them visually around a circle
          const member_names: string[] = Array.from(group_members);
          const angle_incremental = (2 * Math.PI) / member_names.length;
    
          for (let i = 0; i < member_names.length; i++) {
            // set the name for the new node
            const node_name: string = member_names[i]
    
            // set the location of the new node
            const x_coord = 265 + Math.cos(angle_incremental * i) * 150;
            const y_coord = 200 + Math.sin(angle_incremental * i) * 150;
    
            // create the new node
            const new_node: GraphNode = new GraphNode(node_name, mode, {
              x: x_coord,
              y: y_coord,
            });
    
            new_grouped_node.addNode(new_node);
            this.props.onNodeCreation(node_name);
          }
    
          // update the state of the editor
          this.setState({
            groupedGraph: this.state.groupedGraph.addNode(new_grouped_node),
            showGroupedNodeDialog: false,
            selectedGroupCurr: new_grouped_node,
            detailGraph: new_grouped_node.graph,
          });
        }
      }

    handleEdgeCreation(minTimeToEffect: number, maxTimeToEffect: number) {
        const from_group = this.state.selectedGroupPrev;
        const to_group = this.state.selectedGroupCurr;
        if (from_group && to_group) {
            const new_edge = new GroupedGraphEdge(from_group, to_group, {
                min: minTimeToEffect,
                max: maxTimeToEffect,
            });

            this.setState({
                groupedGraph: this.state.groupedGraph.addEdge(new_edge),
                selectedGroupCurr: null,
                selectedGroupPrev: null,
                showGroupedEdgeDialog: false,
            });
        }

        const from_node = this.state.selectedNodePrev;
        const to_node = this.state.selectedNodeCurr;
        if (this.state.detailGraph && from_node && to_node) {
            const new_edge = new GraphEdge(from_node, to_node, {
                min: minTimeToEffect,
                max: maxTimeToEffect,
            });
            this.setState({
                detailGraph: this.state.detailGraph.addEdge(new_edge),
                selectedNodeCurr: null,
                selectedNodePrev: null,
                showDetailEdgeDialog: false,
            });
        }
    }

    selectNode(generalNode: GroupedGraphNode | GraphNode) {
        const isGroup = generalNode instanceof GroupedGraphNode;

        let prevSelected = null;
        if (isGroup) {
            prevSelected = this.state.selectedGroupCurr;
        } else {
            prevSelected = this.state.selectedNodeCurr;
        }

        let prevPrevSelected = null;
        if (isGroup) {
            prevPrevSelected = this.state.selectedGroupPrev;
        } else {
            prevPrevSelected = this.state.selectedNodePrev;
        }

        // First unselect the edge in the graph view to avoid confusion
        if (isGroup) {
            this.setState({
                selectedGroupEdge: null,
                showGroupedNodeDialog: false,
                showGroupedEdgeDialog: false,
                showGroupedEdgeAlert: false,
            });
        } else {
            this.setState({
                selectedDetailEdge: null,
                showDetailNodeDialog: false,
                showDetailEdgeDialog: false,
                showDetailEdgeAlert: false,
            });
        }

        // If the user clicked on a different group,
        // erase previous status of the detailed graph,
        // and display the current detailed graph

        if (isGroup) {
            if (generalNode !== prevSelected) {
                this.setState({
                    detailGraph: generalNode.graph,
                    selectedNodeCurr: null,
                    selectedNodePrev: null,
                    selectedDetailEdge: null,
                    showDetailNodeDialog: false,
                    showDetailEdgeDialog: false,
                });

                // If the user clicked on the same node for the third time
                // reset everything in the detailed graph and hide it
            } else if (generalNode === prevPrevSelected) {
                this.setState({
                    detailGraph: null,
                    selectedNodeCurr: null,
                    selectedNodePrev: null,
                    selectedDetailEdge: null,
                    showDetailNodeDialog: false,
                    showDetailEdgeDialog: false,
                });
            }
        }

        // update node selection

        // when no nothing has been selected
        if (!prevSelected) {
            if (isGroup) {
                this.setState({
                    selectedGroupCurr: generalNode,
                });
            } else {
                this.setState({
                    selectedNodeCurr: generalNode,
                });
            }

            // when only one node has been selected
        } else if (!prevPrevSelected) {
            if (isGroup && prevSelected instanceof GroupedGraphNode) {
                if (
                    !this.state.groupedGraph.edgeExists(
                        prevSelected,
                        generalNode
                    )
                ) {
                    this.setState({
                        selectedGroupCurr: generalNode,
                        selectedGroupPrev: prevSelected,
                        detailGraph: generalNode.graph,
                        showGroupedEdgeDialog: true,
                    });
                } else {
                    this.setState({
                        selectedGroupCurr: null,
                        selectedGroupPrev: null,
                        showGroupedEdgeDialog: false,
                        showGroupedEdgeAlert: true,
                        showGroupedNodeDialog: false,
                    });
                }
            } else if (this.state.detailGraph) {
                if (
                    !this.state.detailGraph.edgeExists(
                        prevSelected,
                        generalNode
                    )
                ) {
                    this.setState({
                        selectedNodeCurr: generalNode,
                        selectedNodePrev: prevSelected,
                        showDetailEdgeDialog: true,
                    });
                } else {
                    this.setState({
                        selectedNodeCurr: null,
                        selectedNodePrev: null,
                        showDetailEdgeDialog: false,
                        showDetailEdgeAlert: true,
                    });
                }
            }

            // when two nodes are selected
        } else {
            if (
                generalNode !== prevPrevSelected &&
                generalNode !== prevSelected
            ) {
                if (isGroup) {
                    this.setState({
                        selectedGroupCurr: generalNode,
                        selectedGroupPrev: null,
                        showGroupedEdgeDialog: false,
                        showGroupedNodeDialog: false,
                    });
                } else {
                    this.setState({
                        selectedNodeCurr: generalNode,
                        selectedNodePrev: null,
                        showDetailEdgeDialog: true,
                    });
                }
            } else if (generalNode === prevPrevSelected) {
                if (isGroup) {
                    this.setState({
                        selectedGroupCurr: null,
                        selectedGroupPrev: null,
                        showGroupedEdgeDialog: false,
                        showGroupedNodeDialog: false,
                    });
                } else {
                    this.setState({
                        selectedNodeCurr: null,
                        selectedNodePrev: null,
                        showDetailEdgeDialog: false,
                    });
                }
            } else if (
                generalNode === prevSelected &&
                prevPrevSelected instanceof GroupedGraphNode
            ) {
                if (isGroup) {
                    this.setState({
                        selectedGroupCurr: prevPrevSelected,
                        selectedGroupPrev: null,
                        showGroupedEdgeDialog: false,
                        showGroupedNodeDialog: false,
                    });
                } else {
                    this.setState({
                        selectedNodeCurr: prevPrevSelected,
                        selectedNodePrev: null,
                        showDetailEdgeDialog: true,
                    });
                }
            }
        }
    }

    selectEdge(generalEdge: GroupedGraphEdge | GraphEdge) {
        const isGroup = generalEdge instanceof GroupedGraphEdge;

        console.log("clicked on edge, it is a group egde", isGroup);

        let prevSelected = null;
        if (isGroup) {
            prevSelected = this.state.selectedGroupEdge;
        } else {
            prevSelected = this.state.selectedDetailEdge;
        }

        if (isGroup) {
            if (!prevSelected || prevSelected !== generalEdge) {
                this.setState({ selectedGroupEdge: generalEdge });
            } else if (prevSelected === generalEdge) {
                this.setState({ selectedGroupEdge: null });
            }
        } else {
            if (!prevSelected || prevSelected !== generalEdge) {
                this.setState({ selectedDetailEdge: generalEdge });
            } else if (prevSelected === generalEdge) {
                this.setState({ selectedDetailEdge: null });
            }
        }
    }

    placeholder() {
        return <GraphEditorIntro />;
    }

    render() {
        const selected_groups = [
            this.state.selectedGroupCurr,
            this.state.selectedGroupPrev,
        ];
        const selected_nodes = [
            this.state.selectedNodeCurr,
            this.state.selectedNodePrev,
        ];

        return (
            <div>
                <div className="draw-line">
                    <Heading as="h2" size="lg" paddingTop={"10px"}>
                        Step 2: Define Your Causal Graph
                    </Heading>
                </div>

                <div className="GraphEditor">
                    <div>
                        <GroupedGraphView
                            groupedGraph={this.state.groupedGraph}
                            selectedGroup={selected_groups}
                            selectedGroupEdge={this.state.selectedGroupEdge}
                            onEmptyLocationClick={(pos: Position) =>
                                this.selectEmptyLocation(pos, "grouped")
                            }
                            onNodeClick={this.selectNode}
                            onEdgeClick={this.selectEdge}
                            nodeRadius={25}
                        />

                        {this.state.showGroupedNodeDialog && (
                            <GroupedNodeDialog
                                onGroupCreation={this.handleGroupCreation}
                                variables={this.props.variables}
                            />
                        )}

                        {this.state.showGroupedEdgeDialog &&
                            this.state.selectedGroupCurr &&
                            this.state.selectedGroupPrev && (
                                <EdgeDialog
                                    fromNode={this.state.selectedGroupPrev}
                                    toNode={this.state.selectedGroupCurr}
                                    onEdgeCreation={this.handleEdgeCreation}
                                />
                            )}

                        {this.state.showGroupedEdgeAlert && (
                            <Alert
                                status="error"
                                width={"500px"}
                                variant="left-accent"
                            >
                                <AlertIcon />
                                Edge already exists!
                            </Alert>
                        )}
                    </div>
                    <div>
                        {this.state.selectedGroupCurr === null &&
                            this.placeholder()}

                        {this.state.detailGraph &&
                            this.state.selectedGroupCurr && (
                                <DetailGraphView
                                    group={this.state.selectedGroupCurr}
                                    graph={this.state.detailGraph}
                                    selectedNode={selected_nodes}
                                    selectedDetailEdge={
                                        this.state.selectedDetailEdge
                                    }
                                    onEmptyLocationClick={(pos: Position) =>
                                        this.selectEmptyLocation(pos, "detail")
                                    }
                                    onNodeClick={this.selectNode}
                                    onEdgeClick={this.selectEdge}
                                    nodeRadius={25}
                                />
                            )}

                        {this.state.showDetailEdgeDialog &&
                            this.state.selectedNodePrev &&
                            this.state.selectedNodeCurr && (
                                <EdgeDialog
                                    fromNode={this.state.selectedNodePrev}
                                    toNode={this.state.selectedNodeCurr}
                                    onEdgeCreation={this.handleEdgeCreation}
                                />
                            )}

                        {this.state.showDetailEdgeAlert && (
                            <Alert
                                status="error"
                                width={"500px"}
                                variant="left-accent"
                            >
                                <AlertIcon />
                                Edge already exists!
                            </Alert>
                        )}
                    </div>
                </div>
                <div style={{ textAlign: "center", width: "1055px" }}>
                    <Button
                        margin={"10px"}
                        marginLeft={"0px"}
                        size="md"
                        onClick={() =>
                            postGraphToBackend(this.state.groupedGraph)
                        }
                    >
                        Confirm Graph
                    </Button>
                </div>
            </div>
        );
    }
}

export default GraphEditor;
