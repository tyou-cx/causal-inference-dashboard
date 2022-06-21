from typing import Iterable
import pandas as pd
import numpy as np

from Graphs import GroupedCausalGraph

from sklearn.ensemble import RandomForestRegressor


def set_df_index(data):
    """
    Set hierarchical index for the input data.

    Parameters
    ----------
    data : Pandas DataFrame containing columns patient_id and time
        Input data.

    Returns
    -------
    df : Pandas DataFrame
        Input data with columns patient_id and time as hierarchical index.
    """
    return data.set_index(["patient_id", "time"])


def markov_transform(df, order=5, max_delta_t=0):
    """
    Shift variables backwards and forwards in time. Add new columns in the
    data for the shifted variables.

    Parameters
    ----------
    df : Pandas DataFrame, must have hierarchical index [patient_id, time]
        Input data in the proper format.
    order : int
        Order of the Markov model (how many timesteps to go backwards)
    max_delta_t : int
        Maximum number of time steps between cause and effect (how many timesteps
        to go forward)

    Returns
    -------
    out : tuple of Pandas DataFrame
        triple of data frames (past_df, present_df, future_df)
        DataFrames contain columns corresponding to time-shifted copies of variables.
    """

    past_df = pd.concat(
        [
            df.groupby(level="patient_id")
            .transform(lambda s: s.shift(i))
            .rename(lambda name: name + "_tm" + str(i), axis="columns")
            for i in range(1, order + 1)
        ],
        axis=1,
    )

    present_df = df  # df.rename(lambda name: name+"_t0", axis='columns')

    future_df = pd.concat(
        [
            df.groupby(level="patient_id")
            .transform(lambda s: s.shift(i))
            .rename(lambda name: name + "_tp" + str(-i), axis="columns")
            for i in range(-max_delta_t, 0)
        ],
        axis=1,
    )

    return (past_df, present_df, future_df)


def make_data_dict(
    df,
    var_static=None,
    var_dynamic=None,
    causal_graph=None,
    markov_order=5,
    max_delta_t=3,
    dummies_for_categorical=False,
):
    """
    Transform long-format data frame into wide format.

    df : Pandas DataFrame, must have columns [patient_id, time]
        Input data in the proper format.
    order : int
        Order of the Markov model (how many timesteps to go backwards)
    max_delta_t : int
        Maximum number of time steps between cause and effect variables
    var_static : list of string
        List of static variable names.
    var_dynamic : list of string
        List of dynamic variable names.
    causal_graph : GroupedCausalGraph
        Causal graph containing relevant variables. If provided, the arguments
        var_static and var_dynamic will not be used.
    dummies_for_categorical : bool
        Determine whether static categorical variables should be converted to
        dummy coding. Convert if True, do not convert otherwise.
    """
    new_df = df.set_index(["patient_id", "time"])

    if causal_graph:
        static_nodes, dynamic_nodes = causal_graph.getStaticDynamicNodes()
        var_static = [node.name for node in static_nodes]
        var_dynamic = [node.name for node in dynamic_nodes]
    elif (not var_static) or (not var_dynamic):
        raise Exception("list of arguments is missing either static or dynamic variables")

    past_df, present_df, future_df = markov_transform(
        new_df.loc[:, var_dynamic], order=markov_order, max_delta_t=max_delta_t
    )
    static_df = new_df.loc[:, var_static]

    # check if there are static variables
    if len(var_static) > 0:
        common_idx = pd.concat([past_df, present_df, future_df, static_df], axis=1).dropna().index

        data = {
            "past": past_df.loc[common_idx],
            "present": present_df.loc[common_idx],
            "future": future_df.loc[common_idx],
            "static": pd.get_dummies(static_df.loc[common_idx])
            if dummies_for_categorical
            else static_df.loc[common_idx],
        }
    else:
        common_idx = pd.concat([past_df, present_df, future_df], axis=1).dropna().index

        data = {
            "past": past_df.loc[common_idx],
            "present": present_df.loc[common_idx],
            "future": future_df.loc[common_idx],
            "static": None,
        }

    return data


def causal_effect_from_data_dict(
    data_dict: dict,
    causal_graph: GroupedCausalGraph,
    cause_variable: str,
    response_variable: str,
    delta_t_values: Iterable,
    intervention_values: Iterable,
    model=RandomForestRegressor(),
    dummies_for_categorical=True,
):
    """
    Compute the causal effect of cause_variable on response_variable.

    Parameters
    ----------
    data_dict : dictionary
        Dictionary with keys 'past', 'present', 'future', and 'static';
        the output of the function make_data_dict
    causal_graph : GroupedCausalGraph
        Causal graph specifying causal relationships between variables.
    cause_variable : str
        Name of the cause variable
    response_variable : str
        Name of the response variable
    delta_t_values : Iterable
        Sequence of time shifts between cause and response variables
    intervention_values : Iterable
        Sequence of intervention values
    model : supervised regression model satisfying sklearn API
        The regression model to use for computing causal effects
    dummies_for_categorical : bool
        Determine whether static categorical variables should be converted to
        dummy coding. Convert if True, do not convert otherwise.

    Returns
    -------
    causal_effect_data : dict with keys 'intervention', 'delta_t', and 'causal_effects'
        Dictionary whose value at key 'causal_effects' is a 2D NumPy array that stores
        the causal effect for each combination of intervention value and delta_t value.
        The intervention value indexes the rows and the delta_t value indexes the columns
        of this matrix.
    """

    causal_effects = np.zeros(shape=(len(intervention_values), len(delta_t_values)))

    # get causal node corresponding to cause_variable
    cause_node = causal_graph.getFlattenedNode(cause_variable)
    if not cause_node:
        raise Exception("could not find the cause variable in the graph!")

    # get correct nodes to condition on (parents of the causal variable)
    parent_nodes = causal_graph.getParents(cause_node)
    parents_static = [node.name for node in parent_nodes if node.isStatic()]

    # create the temporal copies, for example X_tm1, X_tm2, X_tm3... for node X
    parents_dynamic_nodes = [node for node in parent_nodes if node.isDynamic()]
    parents_dynamic = []
    for dyn_parent in parents_dynamic_nodes:
        parents_dynamic += causal_graph.getTemporalCopiesOfParent(parent_node=dyn_parent, effect_node=cause_node)

    # make sure we don't have any parents that aren't in the data

    # the data we condition on during the regressions stays the same
    data_past = data_dict["past"].loc[:, parents_dynamic]

    # check if the data contains any static variables
    if data_dict["static"] is not None:

        data_static = (
            pd.get_dummies(data_dict["static"].loc[:, parents_static])
            if dummies_for_categorical
            else data_dict["static"].loc[:, parents_static]
        )

        X_df = pd.concat([data_past, data_static, data_dict["present"][cause_variable]], axis=1)
    else:
        X_df = pd.concat([data_past, data_dict["present"][cause_variable]], axis=1)

    # now loop over different intervention values, as well as
    # different time shifts between cause and effect
    for i, intervention_val in enumerate(intervention_values):
        for j, delta_t in enumerate(delta_t_values):
            # define response variable for regression
            y = data_dict["future"][response_variable + "_tp" + str(delta_t)].values

            # carry out the regression
            X = X_df.values
            model.fit(X, y)

            # predict with cause variable set to intervention_value
            X_intervention = np.concatenate([X[:, :-1], intervention_val * np.ones(shape=(X.shape[0], 1))], axis=1)
            pred = model.predict(X_intervention)
            causal_effects[i, j] = np.mean(pred)

    return {"intervention": intervention_values, "delta_t": delta_t_values, "causal_effects": causal_effects}


def compute_causal_effect(
    data,
    causal_graph,
    cause_variable: str,
    response_variable: str,
    delta_t_values: Iterable,
    intervention_values: Iterable,
    model=RandomForestRegressor(),
):
    """
    End-to-end computation of causal effects.

    Parameters
    ----------
    data : Pandas DataFrame, must have columns [patient_id, time] (!!!)
        Input data in the proper format.
    causal_graph : GroupedCausalGraph
        Causal graph specifying causal relationships between variables.
    cause_variable : str
        Name of the cause variable
    response_variable : str
        Name of the response variable
    delta_t_values : Iterable
        Sequence of time shifts between cause and response variables
    intervention_values : Iterable
        Sequence of intervention values
    model : supervised regression model satisfying sklearn API
        The regression model to use for computing causal effects

    Returns
    -------
    causal_effect_data : dict with keys 'intervention', 'delta_t', and 'causal_effects'
        Dictionary whose value at key 'causal_effects' is a 2D NumPy array that stores
        the causal effect for each combination of intervention value and delta_t value.
        The intervention value indexes the rows and the delta_t value indexes the columns
        of this matrix.
    """

    # use max(delta_t_values) as max_delta_t
    max_delta_t = max(delta_t_values)

    # use maximum time_to_effect as markov_order
    markov_order = causal_graph.max_time_to_effect

    # REMARK
    # [
    # later on, could set markov order differently. if max_time_to_effect is greater than markov_order,
    # truncate the time_to_effect so that the parents with higher "_tmX" are simply thrown
    # out of the list of parent variables, and print a warning message (but do not throw error)
    # ]

    data_dict = make_data_dict(
        data,
        causal_graph=causal_graph,
        markov_order=markov_order,
        max_delta_t=max_delta_t,
        dummies_for_categorical=False,
    )

    result_dict = causal_effect_from_data_dict(
        data_dict,
        causal_graph,
        cause_variable,
        response_variable,
        delta_t_values,
        intervention_values,
        model=model,
        dummies_for_categorical=True,
    )

    return result_dict
