import { Heading } from "@chakra-ui/react";
import React from "react";
import Chart from "react-google-charts";

interface TimeSeriesProps {
    cause_var: string;
    effect_var: string;
    data: any;
    data_version: number;
    dosage: number;
}

interface TimeSeiresState {
    causal_var: string;
    effect_var: string;
    data: any;
    data_version: number;
    dosage: number;
}

class TimeSeriesVisualizer extends React.Component<
    TimeSeriesProps,
    TimeSeiresState
> {
    constructor(props: TimeSeriesProps) {
        super(props);
        this.state = {
            causal_var: this.props.cause_var,
            effect_var: this.props.effect_var,
            data: this.props.data,
            data_version: 0,
            dosage: 0,
        };
    }

    static getDerivedStateFromProps(
        props: TimeSeriesProps,
        state: TimeSeiresState
    ) {
        if (props.data_version !== state.data_version || props.dosage !== state.dosage) {
            return {
                cause_var: props.cause_var,
                effect_var: props.effect_var,
                data: props.data,
                delta_time: props.data_version
            };
        }
        return null;
    }

    render() {
        const xtitle =
            "Causal Effect of " +
            this.state.causal_var +
            " on " +
            this.state.effect_var;

        return (
            <div>
                <Heading size={'md'} paddingTop={'20px'} paddingLeft={'80px'}> {xtitle} </Heading>
                <div className="container_timeseries">
                    <Chart
                        width={"700px"}
                        height={"410px"}
                        chartType="LineChart"
                        loader={<div>Loading Chart</div>}
                        data={this.state.data}
                        options={{
                            hAxis: {
                                title: "Time Steps (x10 minutes)",
                            },
                            vAxis: {
                                title: "Effect",
                            },
                            series: {
                                1: { curveType: "function" },
                            },

                            legend: {
                                position: "right",
                                alignment: "center",
                                floating: true,
                                title: "dosage",
                            },

                            intervals: { style: "area" },
                            backgroundColor: "transparent",
                        }}
                        rootProps={{ "data-testid": "2" }}
                    />
                </div>
            </div>
        );
    }
}

export default TimeSeriesVisualizer;
