import axios from "axios";

export const BASE_URL = "http://127.0.0.1:8000";
const destination = `${BASE_URL}/parse_graph/`;

// function passes the nodes and edges from GraphEditor to backend
async function postGraphToBackend(GraphObj) {
    let new_GraphObj = JSON.parse(JSON.stringify(GraphObj));

    function filterObject(obj, key) {
        for (var i in obj) {
            if (i === key) {
                console.log("Deleting position attribute from ", obj);
                delete obj[key];
            } else if (typeof obj[i] == "object") {
                filterObject(obj[i], key);
            }
        }
        return obj;
    }

    filterObject(new_GraphObj, "position");
    console.log("NewGraph", new_GraphObj);
    let res = await axios.post(destination, new_GraphObj);

    console.log(res);
}

export default postGraphToBackend;

// const data = { 'nodes': nodes, 'edges': edges }
// const options = {
//     method: 'post',
//     url: '/login',
//     data: {
//       firstName: 'Finn',
//       lastName: 'Williams'
//     },
//     transformRequest: [(data, headers) => {
//       // transform the data

//       return data;
//     }]
//   };

//   // send the request
//   axios(options);
