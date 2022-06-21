import React from "react";
import { GroupedGraphNode } from "../../classes/GroupedGraph";
import { GraphNode } from "../../classes/Graph";
import {
    Text,
    Stack,
    Button,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react";
import { colorCode } from "./GraphEditor";

interface EdgeDialogProps {
    onEdgeCreation: Function;
    fromNode: GroupedGraphNode | GraphNode;
    toNode: GroupedGraphNode | GraphNode;
}

interface EdgeDialogState {
    min: number;
    max: number;
}

class EdgeDialog extends React.Component<EdgeDialogProps, EdgeDialogState> {
    constructor(props: EdgeDialogProps) {
        super(props);
        this.updateEdge = this.updateEdge.bind(this);
        this.handleEdgeCreation = this.handleEdgeCreation.bind(this);
        this.verifyEdgeAttributes = this.verifyEdgeAttributes.bind(this);
        this.state = { min: 1, max: 1 };
    }

    updateEdge(e: string, attribute: string) {
        if (attribute === "min") {
            this.setState({ min: parseInt(e) });
        } else if (attribute === "max") {
            this.setState({ max: parseInt(e) });
        } else {
            throw new Error("did not specify a valid property of a Edge");
        }
    }

    handleEdgeCreation() {
        this.props.onEdgeCreation(this.state.min, this.state.max);
    }

    verifyEdgeAttributes(state: EdgeDialogState): boolean {
        return 0 <= state.min && state.min <= state.max;
    }

    render() {
        console.log(this.props.fromNode);
        const okToCreateEdge: boolean = this.verifyEdgeAttributes(this.state);

        // only ask for time-to-effect input if this is a dynamic-to-dynamic grouped edge
        const queryTimeToEffect: boolean =
            this.props.fromNode.mode === "dynamic" &&
            this.props.toNode.mode === "dynamic";

        const edgeType: string =
            this.props.fromNode.mode + "-to-" + this.props.toNode.mode;

        return (
            <div className="EdgeDialog">
                <Stack direction="row" align={"center"} paddingBottom={"5px"}>
                    <Text>Adding an edge from </Text>
                    <Text
                        backgroundColor={colorCode.highlight1}
                        paddingLeft={"5px"}
                        paddingRight={"5px"}
                        borderRadius={"5px"}
                    >
                        {this.props.fromNode.name} ({this.props.fromNode.mode})
                    </Text>
                    <Text> to </Text>
                    <Text
                        backgroundColor={colorCode.highlight2}
                        paddingLeft={"5px"}
                        paddingRight={"5px"}
                        borderRadius={"5px"}
                    >
                        {this.props.toNode.name} ({this.props.toNode.mode}){" "}
                    </Text>
                </Stack>

                <Stack shouldWrapChildren direction="row" align={"center"}>
                    <Text> Time-to-Effect: Min: </Text>
                    <NumberInput
                        size="sm"
                        maxW={16}
                        variant={"filled"}
                        defaultValue={this.state.min}
                        value={this.state.min}
                        isDisabled={!queryTimeToEffect}
                        onChange={(v) => this.updateEdge(v, "min")}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <Text>Max:</Text>
                    <NumberInput
                        size="sm"
                        maxW={16}
                        variant={"filled"}
                        defaultValue={this.state.min}
                        min={this.state.min}
                        value={this.state.max}
                        isDisabled={!queryTimeToEffect}
                        onChange={(v) => this.updateEdge(v, "max")}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </Stack>
                <Button
                    size="sm"
                    colorScheme="gray"
                    variant="solid"
                    onClick={this.handleEdgeCreation}
                    disabled={!okToCreateEdge}
                >
                    Create Edge
                </Button>
            </div>
        );
    }
}

export default EdgeDialog;
