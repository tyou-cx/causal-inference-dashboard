export interface queryBackendProps {
    route: string;
}

export const BASE_URL = "http://127.0.0.1:8000";

export const getVariablesFromBackend = async (): Promise<string[]> => {
    const requestURL = `${BASE_URL}/variables`;
    // const formData = new FormData();
    const data = await fetch(requestURL, {
        method: "GET",
    })
        .then((response) => response.json())
        .then((d) => d as string[]);

    return data;
};

export default getVariablesFromBackend;
