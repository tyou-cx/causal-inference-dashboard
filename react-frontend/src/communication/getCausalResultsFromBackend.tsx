// import causaldict from "../components/EstimationPane";
export const BASE_URL = "http://127.0.0.1:8000";

export interface CausalResults {
    intervention: number[],
    delta_t: number[],
    causal_effects: number[][]
}

// getCausalResultsFromBackend: receive causal results in the form
// {intervention: ..., delta_t: ..., causal_effects: ...}
export const getCausalResultsFromBackend = async (
    cause_var: string,
    response_var: string,
    min_intervention: number,
    max_intervention: number,
    max_delta_t: number,
): Promise<CausalResults> => {
    const requestURL = `${BASE_URL}/causal_effect?cause_variable=${cause_var}&` +
        `response_variable=${response_var}&max_delta_t=${max_delta_t}&` +
        `min_intervention=${min_intervention}&max_intervention=${max_intervention}`;

    const causal_results = await fetch(requestURL, {
        method: "GET",
    })
        .then((response) => response.json())
        .then((json) => json as CausalResults)

    console.log('causal_results', causal_results)
    return causal_results;
};

export default getCausalResultsFromBackend;
