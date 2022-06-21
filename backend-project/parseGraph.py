from Graphs import CausalGraph, CausalEdge, CausalNode, \
    GroupedCausalGraph, GroupedCausalNode, \
    D2DGroupedCausalEdge, S2DGroupedCausalEdge, S2SGroupedCausalEdge


def parseGroupedGraph(graph_json: dict):
    """
    Parse JSON into a GroupedCausalGraph. The JSON
    comes from stringifying the frontend representation
    of a grouped causal graph.
    """
    grouped_graph = GroupedCausalGraph()

    for node in graph_json['nodes']:
        parsed_node = parseGroupedGraphNode(node, grouped_graph)
        grouped_graph.add_node(parsed_node)

    for edge in graph_json['edges']:
        parsed_edge = parseGroupedGraphEdge(edge, grouped_graph)
        if isinstance(parsed_edge, D2DGroupedCausalEdge):
            grouped_graph.add_edge(parsed_edge.from_node, parsed_edge.to_node,
                                   parsed_edge.time_to_effect)
        else:
            grouped_graph.add_edge(parsed_edge.from_node, parsed_edge.to_node)

    return grouped_graph


def parseGroupedGraphNode(node_json: dict, grouped_graph: GroupedCausalGraph):
    """
    Parse JSON into a GroupedCausalNode. The JSON
    comes from stringifying the frontend representation
    of a grouped causal node.

    Parameters
    ----------
    node_json : dict
    grouped_graph : GroupedCausalGraph

    Returns
    -------
    grouped_node : GroupedCausalNode
    """
    name_json = node_json['name']
    dynamic_json = (node_json['mode'] == 'dynamic')
    graph_json = node_json['graph']

    grouped_node = GroupedCausalNode(name=name_json,
                                     parent=grouped_graph,
                                     dynamic=dynamic_json)

    grouped_node.graph = parseGraph(graph_json, grouped_node)

    return grouped_node


def parseGroupedGraphEdge(edge_json: dict, grouped_graph: GroupedCausalGraph):
    """
    Parse JSON into a GroupedCausalEdge. The JSON 
    comes from stringifying the frontend representation
    of a grouped causal edge.
    """
    fromNode_json = edge_json['from_node']
    toNode_json = edge_json['to_node']

    if (fromNode_json['mode'] == 'dynamic') and (toNode_json['mode'] == 'dynamic'):
        # need to retrieve time-to-effect
        if ("time_to_effect" in edge_json):
            time_to_effect = {'min': edge_json['time_to_effect']['min'],
                              'max': edge_json['time_to_effect']['max']}
            edge = D2DGroupedCausalEdge(
                fromNode_json['name'], toNode_json['name'], time_to_effect)
        else:
            raise Exception(
                'Failed to parse D2DCausalEdge: could not access time-to-effect data.')

    elif (fromNode_json['mode'] == 'static') and (toNode_json['mode'] == 'dynamic'):
        edge = S2DGroupedCausalEdge(fromNode_json['name'], toNode_json['name'])

    elif (fromNode_json['mode'] == 'static') and (toNode_json['mode'] == 'static'):
        edge = S2SGroupedCausalEdge(fromNode_json['name'], toNode_json['name'])

    else:
        raise Exception(
            "Failed to parse GroupedCausalEdge: unable to access"
            + " dynamic/static modality of nodes OR attempted to create dynamic-to-static edge (not possible).")

    return edge


def parseGraph(graph_json: dict, grouped_node: GroupedCausalNode):
    """
    Parse JSON into a CausalGraph. The JSON comes from
    stringifying the frontend representation of a causal
    graph.

    Parameters
    ----------
    graph_json : dict
        The JSON for this causal graph.
    grouped_node : GroupedCausalNode
        The grouped node to which this causal graph belongs.

    Returns
    -------
    graph : CausalGraph
        The CausalGraph represented by the input JSON
    """
    graph = CausalGraph(parent=grouped_node)

    for node in graph_json['nodes']:
        parsed_node = parseGraphNode(node, graph)
        graph.add_node(parsed_node)

    for edge in graph_json['edges']:
        parsed_edge = parseGraphEdge(edge)
        graph.add_edge(parsed_edge.from_node, parsed_edge.to_node,
                       parsed_edge.time_to_effect)

    return graph


def parseGraphNode(node_json: dict, graph: CausalGraph):
    """
    Parse JSON into a CausalNode. The JSON comes from
    stringifying the frontend representation of a graph
    node.

    Parameters
    ----------

    Returns
    -------
    """
    node_name = node_json['name']
    return CausalNode(name=node_name, graph=graph)


def parseGraphEdge(edge_json: dict):
    """
    Parse JSON into a CausalEdge. The JSON comes from
    stringifying the frontend representation of a graph
    edge.

    Parameters
    ----------

    Returns
    -------
    """
    fromNode_json = edge_json['from_node']
    toNode_json = edge_json['to_node']

    if ("time_to_effect" in edge_json):
        time_to_effect = {'min': edge_json['time_to_effect']['min'],
                          'max': edge_json['time_to_effect']['max']}
    else:
        time_to_effect = None

    edge = CausalEdge(fromNode_json['name'],
                      toNode_json['name'], time_to_effect)

    return edge
