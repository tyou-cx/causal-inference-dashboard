import React from "react";
import "./App.css";
import {
    extendTheme,
    ChakraProvider,
    Heading,
} from "@chakra-ui/react";
import SingleUploadComponent from "./components/SingleUploadComponent";
import GraphEditor from "./components/graph_editor_components/GraphEditor";
import EstimationPane from "./components/EstimationPane";
import Intro from "./intro";


const colors = {
    blue: {
        900: "#1A365D",
        800: "#2A4365",
        700: "#2C5282",
    },
};

const theme = extendTheme({ colors });

export type variablesDict = {
    [key: string]: {
        mode: "dynamic" | "static";
        group: null | string
        used: Boolean;
    };
};

interface AppState {
    variables: variablesDict;
    fileCount: number;
}

class App extends React.Component<{}, AppState> {
    constructor(props: {}) {
        super(props);
        this.state = { variables: {}, fileCount: 0 };
        this.handleDataUpload = this.handleDataUpload.bind(this);
        this.makeNewVariableGroup = this.makeNewVariableGroup.bind(this);
        this.makeNewNode = this.makeNewNode.bind(this);
    }

    handleDataUpload(var_names: string[]) {
        const new_variables = Object.fromEntries(
            new Map(
                var_names.map((name) => [
                    name,
                    { mode: "dynamic", group: null, used: false },
                ])
            )
        );

        const newFileCount = this.state.fileCount + 1;
        this.setState({
            variables: new_variables as variablesDict,
            fileCount: newFileCount,
        });
    }

    // make new group of variables
    makeNewVariableGroup(group_name: string, group_members: Set<string>) {
        const new_variables = this.state.variables;
        group_members.forEach((name) => {
            new_variables[name]["group"] = group_name;
        });
        this.setState({ variables: new_variables });
    }

    // make new nodes
    makeNewNode(node_name: string) {
        const new_variables = this.state.variables;
        console.log("Added " + node_name + " to the variables...");
        new_variables[node_name]["used"] = true;
        this.setState({ variables: new_variables });
    }

    render() {
        return (
            <ChakraProvider theme={theme}>
                <div className="App">
                    <Heading
                        as="h1"
                        size="2xl"
                        noOfLines={1}
                        className="header"
                    >
                        Automatic Causal Inference
                    </Heading>

                    <div className="AppContent">
                        <Intro />

                        <SingleUploadComponent
                            onChange={this.handleDataUpload}
                            variables={Object.keys(this.state.variables)}
                        />

                        <GraphEditor
                            variables={this.state.variables}
                            onGroupCreation={this.makeNewVariableGroup}
                            onNodeCreation={this.makeNewNode}
                        />

                        <EstimationPane
                            variables={Object.keys(this.state.variables).filter(
                                (key) => this.state.variables[key]["used"]
                            )}
                        />
                    </div>
                </div>
            </ChakraProvider>
        );
    }
}

export default App;
