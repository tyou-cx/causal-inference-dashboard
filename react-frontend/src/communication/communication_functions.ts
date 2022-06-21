const BASE_URL = "http://127.0.0.1:8000";

async function send_obj_to_backend(obj: Object, route: string) {
    const requestURL = BASE_URL + "/" + route;
    const response = await fetch(requestURL, {
        method: "POST",
        body: JSON.stringify(obj),
        headers: { "Content-Type": "application/json" },
    })
    
    if (!response.ok) {
        throw Error("Ooops, did not receive a valid response from the server.")
    }

    return response;
}

// async function get_corr_matrix(selected_features: string[]) {
//     const requestURL = BASE_URL + "/get_corr_matrix";
//     const corr_matrix = await fetch(requestURL, {
//         method: "POST",
//         body: JSON.stringify(selected_features),
//         headers: { "Content-Type": "application/json" },
//     })
//         .then((response) => response.json())
//         .catch((error) => {
//             console.log(error);
//         });
//     return corr_matrix;
// }

export { send_obj_to_backend };
