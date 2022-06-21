import React from "react";
import {
    extendTheme,
    ChakraProvider,
    Heading,
    Text,
    Stack,
} from "@chakra-ui/react";

const colors = {
    blue700: "#2C5282",
    blue900: "#1A365D",
    blue800: "#2A4365",
};

class Intro extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                <div id="content">
                    <Stack align={"center"}>
                        <Stack direction="row">
                            <Text as={"em"}>How much would patients'</Text>
                            <Text as={"em"} color={colors.blue700}>
                                Heart Rate
                            </Text>
                            <Text as={"em"}>
                                change 5 minutes after the doctor administrates
                                10mg of
                            </Text>
                            <Text as={"em"} color={colors.blue700}>
                                Adrenaline
                            </Text>
                            <Text as={"em"}>?</Text>
                        </Stack>

                        <Stack direction="row">
                            <Text as={"em"}>How would an increase in </Text>
                            <Text as={"em"} color={colors.blue700}>
                                Stroke Volume
                            </Text>
                            <Text as={"em"}> affect </Text>
                            <Text as={"em"} color={colors.blue700}>
                                Central Venous Pressure
                            </Text>
                            <Text as={"em"}>?</Text>
                        </Stack>

                        <Stack direction="row">
                            <Text as={"em"}> Would the impact differ by </Text>
                            <Text as={"em"} color={colors.blue700}>
                                Gender
                            </Text>
                            <Text as={"em"}>?</Text>
                        </Stack>
                    </Stack>
                </div>

                <Text
                    fontSize='lg'
                    paddingTop="20px"
                    paddingBottom="40px"
                    align="center"
                >
                    Compute and visualize the causal effect in your data in 3 simple steps!
                </Text>
            </div>
        );
    }
}

export default Intro;
