import React from "react";
import "./style.css";
import { Heading, Input, Stack } from "@chakra-ui/react";

import getVariablesFromBackend from "../communication/getVariablesFromBackend";
import postDataToBackend from "../communication/postDataToBackend";

class DataUpload extends React.Component<{ onFileSelection: Function }, {}> {
    constructor(props: { onFileSelection: Function }) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e: any) {
        this.props.onFileSelection(e.target.files[0]);
    }

    render() {
        return (
            <div>
                <div className="draw-line">
                    <Heading as="h2" size="lg" paddingTop="10px"> 
                        Step 1: Upload Your Data
                    </Heading>
                </div>
                <Stack
                    shouldWrapChildren
                    direction="row"
                    align={"center"}
                    paddingTop="20px"
                    paddingLeft="30px"
                    paddingBottom="15px"
                >
                    <Input
                        size="sm"
                        type="file"
                        accept=".csv"
                        onChange={this.handleChange}
                        variant="unstyled"
                    ></Input>
                </Stack>
            </div>
        );
    }
}

class SingleUploadComponent extends React.Component<
    { variables: string[]; onChange: Function },
    {}
> {
    constructor(props: { variables: string[]; onChange: Function }) {
        super(props);
        this.handleFileSelection = this.handleFileSelection.bind(this);
    }

    handleFileSelection(file: any) {
        console.log(file);
        // I am getting the right file!

        // Now send it to the back.
        postDataToBackend(file).then(() =>
            getVariablesFromBackend().then((vars) => this.props.onChange(vars))
        );
    }

    // async uploadFile (e: any) {
    //     const form = new FormData();
    //     form.append('file', e.target.files[0]);

    //     let res = await axios.post('http://127.0.0.1:8000/upload_csv_med_data/', form);

    //     console.log(res)
    // }

    render() {
        return (
            <div>
                <DataUpload onFileSelection={this.handleFileSelection} />
            </div>
        );
    }
}

export default SingleUploadComponent;
