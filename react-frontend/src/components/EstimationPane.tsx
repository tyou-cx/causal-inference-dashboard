// import { timeStamp } from "console";
import React from "react";
import {
    getCausalResultsFromBackend,
    CausalResults,
} from "../communication/getCausalResultsFromBackend";
// import { GoogleDataTable } from "react-google-charts";
// import getVariablesFromBackend from "../communication/getVariablesFromBackend";
// import { handleInputChange } from "react-select/dist/declarations/src/utils";

import {
    Heading,
    Text,
    Stack,
    Button,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    CircularProgress,
} from "@chakra-ui/react";
import TimeSeriesVisualizer from "./TimeSeriesVisualizer";
interface EstimationPaneProps {
    variables: string[];
}

// interface causaldict {
//     intervention: number[],
//     delta_t: number[],
//     causal_effect: any
// }

interface EstimationPaneState {
    variables: string[];
    causal_dict: CausalResults;
    // causal_effect: any;
    cause_var: string;
    effect_var: string;
    max_time_step: number;
    min_intervention: number;
    max_intervention: number;
    // intervention_values: number[],
    step_size: number;
    dosage: number;
    data_version: number;
    show_graph: Boolean;
    show_progress: Boolean;
}

class EstimationPane extends React.Component<
    EstimationPaneProps,
    EstimationPaneState
> {
    constructor(props: EstimationPaneProps) {
        super(props);
        this.state = {
            variables: this.props.variables,
            causal_dict: {
                intervention: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
                delta_t: [0, 1, 2, 3],
                causal_effects: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [2, 2, 2, 2],
                    [3, 3, 3, 3],
                    [4, 4, 4, 4],
                    [5, 5, 5, 5],
                ],
            },
            // causal_effect: [[0, 0, 0, 0]],
            cause_var: this.props.variables[0],
            effect_var: this.props.variables[0],
            min_intervention: 0,
            max_intervention: 0.5,
            // intervention_values: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
            step_size: 0.1,
            max_time_step: 10,
            dosage: 0.5,
            data_version: 0,
            show_graph: false,
            show_progress: false,
        };
        this.getCausalEstimation = this.getCausalEstimation.bind(this);
        this.getData = this.getData.bind(this);
    }

    static getDerivedStateFromProps(
        props: EstimationPaneProps,
        state: EstimationPaneState
    ) {
        if (props.variables.length !== state.variables.length) {
            return {
                variables: props.variables,
                cause_var: props.variables[0],
                effect_var: props.variables[0],
            };
        }
        return null;
    }

    getCausalEstimation() {
        this.setState({ show_graph: false, show_progress: true });
        const new_data_version = this.state.data_version + 1;

        getCausalResultsFromBackend(
            this.state.cause_var,
            this.state.effect_var,
            this.state.min_intervention,
            this.state.max_intervention,
            this.state.max_time_step
        ).then(
            (v) =>
                this.setState({
                    causal_dict: v,
                    data_version: new_data_version,
                    dosage: this.state.min_intervention,
                    show_graph: true,
                    show_progress: false
                }),
            (r) => console.log(r)
        );

        // this.setState({ causal_effect: this.state.causal_dict['causal_effects'] })
        // this.setState({ intervention_values: this.state.causal_dict['intervention'] })
        // this.setState({ step_size: this.state.intervention_values[1] - this.state.intervention_values[0] })
        // console.log('e', this.state.causal_effect)
    }

    getData(dosage: number) {
        var graph_data_header = [
            { type: "string", label: "time" },
            { type: "number", label: this.state.dosage + " µg/kg" },
            // { id: "i0", type: "number", role: "interval" },
            // { id: "i1", type: "number", role: "interval" },
        ];

        var LineData = [];

        const time = this.state.causal_dict["delta_t"];
        LineData.push(graph_data_header);
        // var d = this.state.dosage
        if (typeof dosage === "string") {
            dosage = parseFloat(dosage);
        }
        var index = this.state.causal_dict["intervention"].findIndex(
            (i) => i === dosage
        );
        // console.log("index", index);
        // console.log("ce", this.state.causal_dict["causal_effects"]);
        var dosage_effects = this.state.causal_dict["causal_effects"][index];
        // console.log("d", dosage_effects);
        for (let i = 0; i < dosage_effects.length; i++) {
            LineData.push([time[i]].concat(dosage_effects[i]));
            // console.log(LineData);
        }
        // console.log(LineData);
        return LineData;
    }

    render() {
        // console.log("min:", this.state.min_intervention);
        // console.log("max:", this.state.max_intervention);
        // console.log("max:", this.state.max_time_step);

        return (
            <div>
                <div className="draw-line">
                    <Heading as="h2" size="lg" paddingTop={"10px"}>
                        Step 3: Estimate Causal Effect
                    </Heading>
                </div>
                <div className="section-content">

                    <Stack
                        paddingTop={"15px"}
                        spacing={3}
                        direction={"row"}
                        align={"center"}
                    >
                        <Text> Intervention Variable: </Text>
                        <Select
                            size="sm"
                            width={"110px"}
                            name="intervention"
                            onChange={(e) =>
                                this.setState({ cause_var: e.target.value })
                            }
                        >
                            {this.props.variables.map((variable) => (
                                <option key={variable} value={variable}>
                                    {variable}
                                </option>
                            ))}
                        </Select>

                        <Text> Effect Variable: </Text>
                        <Select
                            size="sm"
                            width={"110px"}
                            name="effect"
                            onChange={(e) =>
                                this.setState({ effect_var: e.target.value })
                            }
                        >
                            {this.props.variables.map((variable) => (
                                <option key={variable} value={variable}>
                                    {variable}
                                </option>
                            ))}
                        </Select>
                    </Stack>

                    <Stack
                        direction="row"
                        align={"center"}
                        spacing={"20px"}
                        marginTop={"10px"}
                        marginBottom={"10px"}
                        zIndex={800}
                    >
                        <Text>Max Time Step:</Text>
                        <NumberInput
                            size="sm"
                            maxW={16}
                            variant={"outline"}
                            defaultValue={this.state.max_time_step}
                            onChange={(e) =>
                                this.setState({ max_time_step: +e })
                            }
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>

                        <Text>Min Intervention Level:</Text>
                        <NumberInput
                            size="sm"
                            maxW={20}
                            min={0}
                            precision={1}
                            step={0.1}
                            variant={"outline"}
                            defaultValue={this.state.min_intervention}
                            onChange={(e) =>
                                this.setState({ min_intervention: +e })
                            }
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>

                        <Text>Max Intervention Level:</Text>
                        <NumberInput
                            size="sm"
                            min={0}
                            precision={1}
                            step={0.1}
                            maxW={20}
                            variant={"outline"}
                            defaultValue={this.state.max_intervention}
                            onChange={(e) =>
                                this.setState({ max_intervention: +e })
                            }
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </Stack>

                    <Stack direction={'row'} align={'center'}>
                        <Button
                            margin={"10px"}
                            marginLeft={"0px"}
                            size="md"
                            onClick={() => this.getCausalEstimation()}
                        >
                            Compute Causal Effect
                        </Button>


                        {this.state.show_progress &&
                            (
                                <><CircularProgress size='25px' isIndeterminate /><Text as={"em"}> Please be patient... It can take up to a minute to compute the causal effect.</Text></>)

                        }

                    </Stack>

                    {this.state.show_graph && (
                        <div>
                            <Stack
                                direction="row"
                                align={"center"}
                                spacing={"20px"}
                                marginTop={"10px"}
                                marginBottom={"10px"}
                                zIndex={800}
                            >
                                <Text> Current Intervention Level: </Text>
                                <NumberInput
                                    min={this.state.min_intervention}
                                    max={this.state.max_intervention}
                                    size="sm"
                                    maxW={20}
                                    precision={1}
                                    step={this.state.step_size}
                                    variant={"outline"}
                                    defaultValue={1}
                                    value={this.state.dosage}
                                    onChange={(e) =>
                                        this.setState({ dosage: parseFloat(e) })
                                    }
                                    zIndex={800}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                <Slider
                                    min={this.state.min_intervention}
                                    max={this.state.max_intervention}
                                    maxWidth={"440px"}
                                    step={this.state.step_size} // change here TODO
                                    marginLeft={"100px"}
                                    focusThumbOnChange={false}
                                    value={this.state.dosage}
                                    // defaultValue={this.state.dosage}
                                    onChangeEnd={(e) =>
                                        this.setState({ dosage: e })
                                    }
                                    onChange={(e) =>
                                        this.setState({ dosage: e })
                                    }
                                >
                                    <SliderTrack>
                                        <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb
                                        fontSize="sm"
                                        boxSize="32px"
                                        children={this.state.dosage}
                                    />
                                </Slider>
                            </Stack>

                            <TimeSeriesVisualizer
                                cause_var={this.state.cause_var}
                                effect_var={this.state.effect_var}
                                data={this.getData(this.state.dosage)}
                                data_version={this.state.data_version}
                                dosage={this.state.dosage}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default EstimationPane;
