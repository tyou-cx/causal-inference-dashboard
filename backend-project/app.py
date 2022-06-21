from ast import Call
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import aiofiles
import json
import pickle
import numpy as np

import pydantic
import random

from sklearn.ensemble import RandomForestRegressor
from causal_inference import compute_causal_effect
from Graphs import GroupedCausalGraph
from parseGraph import parseGroupedGraph
from typing import Callable, Type
from pydantic import BaseModel

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ROOT = "./data/"
DATA_DESTINATION = ROOT + "user_data.csv"
GRAPH_FILENAME = "grouped_graph.pickle"
GRAPH_DESTINATION = ROOT + GRAPH_FILENAME


def isDataAvailable():
    return os.path.isfile(DATA_DESTINATION)


def isGraphAvailable():
    return os.path.isfile(GRAPH_DESTINATION)


def read_data_safely():
    """
    Read the user-uploaded data from file. Raise
    exception if either no data is available or the
    data does not conform to the required format.
    """
    if isDataAvailable():
        data = pd.read_csv(DATA_DESTINATION)

        # check that data conforms to the requirements
        error_msg = "data does not conform to requirements: must have " + \
            'columns "patient_id" and "time"'
        if ("patient_id" not in data.columns) or ("time" not in data.columns):
            raise ValueError(error_msg)

        # if no exception was raised, return the data
        return data

    else:
        raise Exception("the grouped graph is not available on file")


def read_graph_safely():
    """
    Read the user-defined grouped causal graph from file.
    Raise an exception if the file is not available or the
    parsing process failed.
    """
    if isGraphAvailable():
        causal_graph = read_graph()
        # check that the graph has the right class
        if not isinstance(causal_graph, GroupedCausalGraph):
            raise Exception("failed to parse causal graph!")

        # if no exception was raised, return causal graph
        return causal_graph

    else:
        raise Exception("failed to retrieve graph file")


@app.post("/data")
async def receive_data(file: UploadFile):
    """
    Receive data uploaded by the user on the front end.
    """

    dest_path = DATA_DESTINATION

    # create file and store in temp folder
    async with aiofiles.open(dest_path, "wb") as out_file:
        while content := await file.read(1024):
            await out_file.write(content)

    # read file
    """
    f = open(dest_path, "rb")
    content = f.read()
    """

    data = pd.read_csv(dest_path)
    variables = list(data.columns)

    # uncomment if you want to remove file after upload
    # os.remove(dest_path)

    return {"variables": variables}


@app.get("/variables")
async def get_variables():
    """
    Get the variables of the data uploaded by the user.
    """
    if isDataAvailable():
        variables = list(pd.read_csv(DATA_DESTINATION).columns)
        print(variables)
        return variables
    else:
        raise Exception(
            "unable to retrieve variables because no data is available")


@app.post("/parse_graph")
async def parse_graph(graph: dict = Body(...)):
    """
    Parse graph received from the frontend and return an equivalent GroupedCausalGraph object

    Parameters
    ----------
    graph : dict
        Output of stringifying a GroupedGraph object in the frontend

    Returns
    -------
    out : GroupedCausalGraph
        The GroupedCausalGraph corresponding to the input
    """
    grouped_graph = parseGroupedGraph(graph)

    with open(GRAPH_DESTINATION, "wb") as outfile:
        pickle.dump(grouped_graph, outfile)

    print("Pickled that graph!")


def read_graph():
    """
    Read a grouped graph from file.
    """

    with open(GRAPH_DESTINATION, "rb") as infile:
        grouped_graph_reconstructed = pickle.load(infile)

    print("Reconstructed that graph!")

    return grouped_graph_reconstructed


@app.get("/causal_effect")
def get_causal_effect(
    cause_variable: str,
    response_variable: str,
    min_intervention: float = 0,
    max_intervention: float = 5,
    min_delta_t: int = 1,
    max_delta_t: int = 10,
    n_gridpts_intervention: int = 11,
):
    """
    Compute causal effect of one dynamic variable on another.

    Parameters
    ----------
    cause_variable : str
        The name of the causal variable
    response_variable : str
        The name of the response/effect variable
    min_intervention : float
        The minimum level of intervention at which to compute causal effects
    max_intervention : float
        The maximum level of intervention at which to compute causal effects
    min_delta_t : int
        The minimum time increment for which to compute causal effects
    max_delta_t : int
        Time maximum time increment for which to compute causal effects
    n_gridpts_intervention : int
        The number of grid points for intervention values

    Returns
    -------
    result_dict : dict with keys "intervention", "delta_t", and "causal_effects"
        Dictionary whose value at key 'causal_effects' is a 2D NumPy array that stores
        the causal effect for each combination of intervention value and delta_t value.
        The intervention value indexes the rows and the delta_t value indexes the columns
        of this matrix.
    """
    print("entered the function!")

    data = read_data_safely()
    causal_graph = read_graph_safely()

    # set the sequence of timeshifts between cause and response variables
    delta_t_values = np.arange(min_delta_t, max_delta_t + 1)

    # set the sequence of intervention values to consider
    intervention_values = np.round(np.linspace(
        min_intervention, max_intervention, n_gridpts_intervention), 1)

    result_dict = compute_causal_effect(
        data,
        causal_graph,
        cause_variable,
        response_variable,
        delta_t_values=delta_t_values,
        intervention_values=intervention_values,
    )

    print("see below the backend output for the causal effects:")
    print(result_dict)
    print("finished computing causal effects, now returning results...")

    result_json = {
        "intervention": np.nan_to_num(result_dict["intervention"]).tolist(),
        "delta_t": np.nan_to_num(result_dict["delta_t"]).tolist(),
        "causal_effects": np.nan_to_num(result_dict["causal_effects"]).tolist(),
    }

    return result_json
