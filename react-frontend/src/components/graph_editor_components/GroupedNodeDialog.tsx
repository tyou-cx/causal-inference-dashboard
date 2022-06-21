import React from "react";
import { variablesDict } from "../../App";
import { Stack, Checkbox, Button, Select, Input, Text } from "@chakra-ui/react";

interface GroupedNodeDialogProps {
    variables: variablesDict;
    onGroupCreation: Function;
}

interface GroupedNodeDialogState {
    group_name: string;
    group_mode: string;
    group_members: Set<string>;
}

class GroupedNodeDialog extends React.Component<
    GroupedNodeDialogProps,
    GroupedNodeDialogState
> {
    constructor(props: GroupedNodeDialogProps) {
        super(props);
        this.handleGroupCreation = this.handleGroupCreation.bind(this);
        this.updateGroupName = this.updateGroupName.bind(this);
        this.updateVariableMembership =
            this.updateVariableMembership.bind(this);
        this.state = {
            group_name: "",
            group_mode: "dynamic",
            group_members: new Set(),
        };
    }

    updateGroupName(e: any) {
        this.setState({ group_name: e.target.value });
    }

    updateVariableMembership(
        e: React.ChangeEvent<HTMLInputElement>,
        variable: string
    ) {
        // parse the event
        const variableIsChecked = e.target.checked;

        let new_group_members = this.state.group_members;
        if (variable) {
            if (variableIsChecked && !new_group_members.has(variable)) {
                new_group_members.add(variable);
            } else if (!variableIsChecked && new_group_members.has(variable)) {
                new_group_members.delete(variable);
            }
        }
        this.setState({ group_members: new_group_members });
    }

    handleGroupCreation() {
        this.props.onGroupCreation(
            this.state.group_name,
            this.state.group_members,
            this.state.group_mode
        );
    }

    groupAlreadyExists(group_name: string): boolean {
        // make list of all groups
        const group_list = Object.keys(this.props.variables).map(
            (name) => this.props.variables[name].group
        );

        return group_list.includes(group_name);
    }

    render() {
        const okToCreateGroup: boolean = !this.groupAlreadyExists(
            this.state.group_name
        );

        return (
            <div className="GroupedNodeDialog">
                <Stack
                    marginTop={"5px"}
                    spacing={3}
                    direction={"row"}
                    align={"center"}
                >
                    <Text> Group Name:</Text>
                    <Input
                        size="sm"
                        width={"174px"}
                        onChange={this.updateGroupName}
                        placeholder='Enter Group Name'

                    />
                    <Text> Node Type: </Text>
                    <Select
                        size="sm"
                        width={"110px"}
                        name="GroupedNodeMode"
                        onChange={(e) =>
                            this.setState({ group_mode: e.target.value })
                        }
                    >
                        <option value="dynamic"> dynamic </option>
                        <option value="static"> static </option>
                    </Select>
                </Stack>

                <Stack
                    width={"500px"}
                    spacing={0}
                    padding={"5px"}
                    direction={["column", "row"]}
                    wrap={"wrap"}
                >
                    {Object.keys(this.props.variables).map((variable) => (
                        (variable !== "patient_id") && (variable !== "time") && 
                        <Checkbox
                            key={variable}
                            width={"120px"}
                            size="md"
                            isDisabled={
                                !(this.props.variables[variable].group === null)
                            }
                            onChange={(e) =>
                                this.updateVariableMembership(e, variable)
                            }
                        >
                            {variable}
                        </Checkbox>
                        
                    ))}
                </Stack>

                <Button
                    size="sm"
                    onClick={this.handleGroupCreation}
                    isDisabled={!okToCreateGroup}
                >
                    Create Node
                </Button>
            </div>
        );
    }
}

export default GroupedNodeDialog;
