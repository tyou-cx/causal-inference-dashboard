import numpy as np
import pandas as pd


class CausalNode:
    """
    Representation of a node in a CausalGraph.
    """

    def __init__(self, name: str, graph):
        """
        Create a Causal Node.

        name : str
            Name of this variable.
        graph : CausalGraph
            Graph to which this variable belongs.
        """
        self.name = name
        self.graph = graph

    def isDynamic(self):
        """
        Return true if this CausalNode is dynamic.
        """
        return self.graph.parent.isDynamic()

    def isStatic(self):
        """
        Return true if this CausalNode is not dynamic
        """
        return not self.isDynamic()

    def __repr__(self):
        """
        Compute string representation of this Causal Node.
        """
        return self.name + " (" + ("dynamic" if self.isDynamic() else "static") + ")"


class CausalGraph:
    """
    Representation of a causal graph.

    Attributes
    ----------
    nodes : dict[str, CausalNode]
        Maps node names to the node objects.
    edges : dict[str, list(CausalEdge)]
        Maps node names to a list of edges from and to the node.

    Methods
    -------
    """

    def __init__(self, parent):
        """
        Create a CausalGraph.
        """
        self.nodes: dict[str, CausalNode] = {}
        self.edges: dict[str, dict[str, CausalEdge]] = {}
        self.parent: GroupedCausalNode = parent

    def add_node(self, node: str or CausalNode, dynamic=True):
        """
        Add a node to this CausalGraph.

        Parameters
        ----------
        node: str | CausalNode
            Node to add to this graph. If str, create a new node 
            with name node. If CausalNode, add directly to the 
            list of nodes.

        Side Effects
        ------------
        Add a node to this CausalGraph.
        """
        if isinstance(node, str):
            self.add_node(CausalNode(name=node, graph=self))
        elif isinstance(node, CausalNode):
            self.nodes[node.name] = node
            self.edges[node.name] = {}
        else:
            raise ValueError(
                'node argument must be of type string or GroupedCausalNode')

    def add_edge(self, from_node: str or CausalNode, to_node: str or CausalNode,
                 time_to_effect: dict = None):
        """
        Add an edge to this CausalGraph.

        Parameters
        ----------
        from_node : str | CausalNode
            Starting node of the new edge. If a str, take the CausalNode
            with name from_node in this CausalGraph (must already exist).
            If a CausalNode, take this node as given.
        to_node : str | CausalNode
            Ending node of the new edge. If a str, take the CausalNode
            with name to_node in this CausalGraph (must already exist).
            If a CausalNode, take this node as given.

        Side Effects
        ------------
        Add a new edge to this CausalGraph.
        """
        # check that nodes specified as strings actually exist in the graph
        if isinstance(from_node, str):
            if from_node in self.nodes:
                from_node = self.nodes[from_node]
            else:
                raise ValueError("node with name " + from_node +
                                 " does not exist in graph")
        if isinstance(to_node, str):
            if to_node in self.nodes:
                to_node = self.nodes[to_node]
            else:
                raise ValueError("node with name " + to_node +
                                 " does not exist in graph")

        # check the type of edge
        edge = CausalEdge(from_node, to_node, time_to_effect=time_to_effect)
        if (time_to_effect['max'] > self.parent.parent.max_time_to_effect):
            self.parent.parent.max_time_to_effect = time_to_effect['max']

        # add to dictionary of edges
        if ((from_node.name not in self.nodes) or (to_node.name not in self.nodes)):
            raise ValueError('nodes do not exist in graph')
        else:
            self.edges[from_node.name][to_node.name] = edge

    def getOutgoingEdges(self, node: CausalNode):
        """
        Return list of outgoing edges for the given node.

        Returns
        -------
        out : list[CausalEdge]
            List of outgoing edges for node.
        """
        return list(self.edges[node.name].values())

    def getIncomingEdges(self, node: CausalNode):
        """
        Return list of incoming edges for the given node.

        Returns
        -------
        out : list[CausalEdge]
            List of incoming edges for node
        """
        incoming_edges = []

        for from_node in self.getNodes():
            if self.edgeExists(from_node=from_node, to_node=node):
                incoming_edges.append(self.edges[from_node.name][node.name])

        return incoming_edges

    def getParents(self, node: CausalNode):
        """
        Find the parent nodes of a CausalNode.

        Parameters
        ----------
        node: CausalNode

        Return
        ------
        out: list of CausalNode
            Return the parents of node in this CausalGraph.
        """

        # get the edges from parents
        return [edge.from_node for edge in self.getIncomingEdges(node)]

    def edgeExists(self, from_node: CausalNode, to_node: CausalNode):
        """
        Return true if an edge exists from from_node to to_node.
        """
        return (to_node.name in self.edges[from_node.name])

    def getEdge(self, from_node: CausalNode, to_node: CausalNode):
        """
        Return the CausalEdge from from_node to to_node, if it exists.
        Otherwise, return False.
        """
        if (to_node.name in self.edges[from_node.name]):
            return self.edges[from_node.name][to_node.name]
        else:
            return False

    def getNodes(self):
        """
        Return a list of the nodes in this graph.
        """
        return list(self.nodes.values())

    def getNode(self, name: str):
        """
        Return the CausalNode of the given name, if it exists.
        """
        if name in self.nodes:
            return self.nodes[name]
        else:
            return False

    def __repr__(self):
        """
        Compute string representation of this Causal Graph.
        """
        graph2str = "--- Causal Graph ---\n"
        graph2str += "\nNodes:\n"
        for node in self.nodes.values():
            graph2str += "\t" + str(node) + "\n"

        graph2str += "\nEdges:\n"

        for edge_dict in self.edges.values():
            for edge in edge_dict.values():
                graph2str += "\t" + str(edge) + "\n"

        return graph2str


class CausalEdge:
    """
    Representation of an edge between CausalNode's in a CausalGraph.
    """

    def __init__(self, from_node, to_node, time_to_effect=None):
        """
        Create a CausalEdge.
        """
        self.from_node = from_node
        self.to_node = to_node
        self.time_to_effect = time_to_effect

    def getTimeToEffect(self):
        """
        Get time-to-effect of this edge.
        """
        if (self.time_to_effect):
            return self.time_to_effect
        else:
            try:
                self_edge = self.graph.parent.edges[self.graph.parent.name][self.graph.parent.name]
                return self_edge.time_to_effect
            except:
                raise Exception(
                    "could not retrieve time_to_effect of edge " + str(self))

    def setTimeToEffect(self, time_to_effect: dict):
        """
        Set time-to-effect for this edge.
        """
        self.time_to_effect = time_to_effect

    def __repr__(self):
        """
        Compute string representation for this CausalEdge.
        """
        if self.time_to_effect:
            return self.from_node.name + " --[" + str(self.time_to_effect['min']) + "," + \
                str(self.time_to_effect['max']) + "]--> " + \
                self.to_node.name  # + "    (dynamic -> dynamic)"
        else:
            return self.from_node.name + " ----> " + \
                self.to_node.name  # + "    (dynamic -> dynamic)"


class GroupedCausalNode:
    """
    Representation of a group of variables.

    Attributes
    ----------
    name : str
        The name of this group of variables.
    dynamic : bool
        True if the variables in this group depend on time.
    graph : CausalGraph
        The causal graph on the variables in this group.
    parent: GroupedCausalGraph
        The grouped causal graph to which this grouped node belongs.

    Methods
    -------
    """

    def __init__(self, name, parent, graph=None, dynamic=True):
        """
        Create a GroupedCausalNode.
        """
        self.name: str = name
        self.parent: GroupedCausalGraph = parent
        self.dynamic: bool = dynamic
        if graph:
            self.graph: CausalGraph = graph
        else:
            self.graph = CausalGraph(parent=self)

    def add_node(self, node: str or CausalNode):
        """
        Add a CausalNode to the graph of this GroupedCausalNode.
        """
        if (self.isDynamic and (isinstance(node, CausalNode) and node.isStatic)):
            raise Exception('cannot add static node to dynamic group')
        elif (self.isStatic and (isinstance(node, CausalNode) and node.isDynamic)):
            raise Exception('cannot add dynamic node to static group')
        else:
            self.graph.add_node(node)

    def add_edge(self, from_node: CausalNode, to_node: CausalNode):
        """
        Add an edge to the graph of this GroupedCausalNode.
        """
        raise NotImplementedError("this function is not implemented yet!")

    def isDynamic(self):
        """
        Return true if this GroupedCausalNode is dynamic.
        """
        return self.dynamic

    def isStatic(self):
        """
        Return true if this GroupedCausalNode is not dynamic.
        """
        return not self.dynamic

    def __repr__(self):
        return self.name


class GroupedCausalEdge:
    """
    Representation of an edge between two GroupedCausalNode's.
    """

    def __init__(self, from_node: GroupedCausalNode, to_node: GroupedCausalNode):
        """
        Create a GroupedCausalEdge.
        """
        self.from_node: GroupedCausalNode = from_node
        self.to_node: GroupedCausalNode = to_node


class D2DGroupedCausalEdge:
    """
    Dynamic-to-dynamic edge representing the causal influence of one dynamic
    GroupedCausalNode on another.
    """

    def __init__(self, from_node, to_node, time_to_effect: dict):
        """
        Create a Dynamic Causal Edge.
        """
        GroupedCausalEdge.__init__(self, from_node, to_node)
        # check that time_to_effect has "min" and "max" keys
        if ('min' not in time_to_effect) or ('max' not in time_to_effect):
            raise ValueError('time_to_effect must have keys "min" and "max"')
        self.time_to_effect = time_to_effect

    def __repr__(self):
        """
        Compute a string representation for this D2DGroupedCausalEdge.
        """
        return self.from_node.name + " --[" + str(self.time_to_effect['min']) + "," + \
            str(self.time_to_effect['max']) + "]--> " + \
            self.to_node.name + "    (dynamic -> dynamic)"


class S2DGroupedCausalEdge:
    """
    Static-to-dynamic edge representing the causal influence of a static
    GroupedCausalNode on a dynamic GroupedCausalNode.
    """

    def __init__(self, from_node, to_node):
        """
        Create an S2SGroupedCausalEdge.
        """
        if (from_node is to_node):
            raise ValueError("cannot create static-to-dynamic self-edge")
        GroupedCausalEdge.__init__(self, from_node, to_node)

    def __repr__(self):
        """
        Compute string representation for this S2DGroupedCausalEdge.
        """
        return self.from_node.name + " ----> " + self.to_node.name + "    (static -> dynamic)"


class S2SGroupedCausalEdge:
    """
    Static-to-static edge representing the causal influence of one
    static GroupedCausalNode on another.
    """

    def __init__(self, from_node, to_node):
        """
        Create an S2SGroupedCausalEdge.
        """
        GroupedCausalEdge.__init__(self, from_node, to_node)

    def __repr__(self):
        """
        Compute string representation for this S2SGroupedCausalEdge.
        """
        return self.from_node.name + " ----> " + self.to_node.name + "    (static -> static)"


class GroupedCausalGraph:
    """
    Represent a grouped causal graph.

    Attributes
    ----------
    nodes : dict[str, GroupedCausalNode]
    edges : dict[str, dict[str, GroupedCausalEdge]]
        Dictionary that maps each name of a GroupedCausalNode
        to a dictionary containing the edges in which the node
        is involved. The dictionary maps names of other nodes
        to GroupedCausalEdge objects.
    """

    def __init__(self):
        """
        Create a GroupedCausalGraph.
        """
        self.nodes: dict[str, GroupedCausalNode] = {}
        self.edges: dict[str, dict[str, GroupedCausalEdge]] = {}
        self.max_time_to_effect = -np.Inf

    def add_node(self, node: str or GroupedCausalNode, dynamic=True):
        """
        Add a node to this GroupedCausalGraph.

        Parameters
        ----------
        node: str | GroupedCausalNode
            Node to add to this grouped graph. If str, create a new
            node with name node. If GroupedCausalNode, add directly
            to the list of nodes.

        Side Effects
        ------------
        Add a node to this GroupedCausalGraph.
        """
        if isinstance(node, str):
            self.add_node(GroupedCausalNode(
                name=node, parent=self, dynamic=dynamic))
        elif isinstance(node, GroupedCausalNode):
            self.nodes[node.name] = node
            self.edges[node.name] = {}
        else:
            raise ValueError(
                'node argument must be of type string or GroupedCausalNode')

    def getEdge(self, from_node: str or GroupedCausalNode, to_node: str or GroupedCausalNode):
        """
        Return edge from from_node to to_node if it exists. Otherwise, return False.
        """
        from_node = self.getNode(from_node)
        to_node = self.getNode(to_node)
        if (from_node and to_node):
            if (to_node.name in self.edges[from_node.name]):
                edge = self.edges[from_node.name][to_node.name]
                return edge
            else:
                return False
        else:
            raise ValueError("failure: unable to access the given nodes")

    def getOutgoingEdges(self, node: GroupedCausalNode):
        """
        Return list of outgoing edges for this grouped causal node.

        Returns
        -------
        out : list[GroupedCausalEdge]
            List of outgoing edges for this grouped causal node
        """
        return list(self.edges[node.name].values())

    def getIncomingEdges(self, node: GroupedCausalNode):
        """
        Return list of incoming edges for this grouped causal node.

        Returns
        -------
        out : list[GroupedCausalEdge]
            List of incoming edges for this grouped causal node
        """
        incoming_edges = []

        for from_node in self.getNodes():
            if self.getEdge(from_node=from_node, to_node=node):
                incoming_edges.append(self.edges[from_node.name][node.name])

        return incoming_edges

    def getNodes(self):
        """
        Return a list of nodes for this GroupedCausalGraph.
        """
        return list(self.nodes.values())

    def add_edge(self, from_node: str or GroupedCausalNode, to_node: str or GroupedCausalNode,
                 time_to_effect: dict = None):
        """
        Add an edge to this GroupedCausalGraph.

        Parameters
        ----------
        from_node : str | GroupedCausalNode
            Starting node of the new edge. If a str, take the GroupedCausalNode
            with name from_node in this GroupedCausalGraph (must already exist).
            If a GroupedCausalNode, take this node as given.
        to_node : str | GroupedCausalNode
            Ending node of the new edge. If a str, take the GroupedCausalNode
            with name to_node in this GroupedCausalGraph (must already exist).
            If a GroupedCausalNode, take this node as given.

        Side Effects
        ------------
        Add a new edge to this GroupedCausalGraph.
        """

        # check that nodes specified as strings actually exist in the graph
        if isinstance(from_node, str):
            if from_node in self.nodes:
                from_node = self.nodes[from_node]
            else:
                raise ValueError("node with name " + from_node +
                                 " does not exist in grouped graph")
        if isinstance(to_node, str):
            if to_node in self.nodes:
                to_node = self.nodes[to_node]
            else:
                raise ValueError("node with name " + to_node +
                                 " does not exist in grouped graph")

        # check the type of edge
        if from_node.isDynamic() and to_node.isDynamic():
            if (not time_to_effect):
                raise ValueError(
                    'must specify time_to_effect to create edge between dynamic nodes')
            if ("min" not in time_to_effect) or ("max" not in time_to_effect):
                raise ValueError(
                    'time_to_effect must have keys "min" and "max"')
            else:
                edge = D2DGroupedCausalEdge(
                    from_node, to_node, time_to_effect=time_to_effect)
                if (time_to_effect['max'] > self.max_time_to_effect):
                    self.max_time_to_effect = time_to_effect['max']
        elif from_node.isStatic() and to_node.isDynamic():
            edge = S2DGroupedCausalEdge(from_node, to_node)
        elif from_node.isStatic() and to_node.isStatic():
            edge = S2SGroupedCausalEdge(from_node, to_node)

        # add to dictionary of edges
        if ((from_node.name not in self.nodes) or (to_node.name not in self.nodes)):
            raise ValueError('nodes do not exist in grouped graph')
        else:
            self.edges[from_node.name][to_node.name] = edge

    def getNode(self, node: str or GroupedCausalNode):
        """
        Return the GroupedCausalNode of the given name, if it exists. Otherwise
        return False.
        """
        if isinstance(node, GroupedCausalNode):
            return node
        elif isinstance(node, str):
            if node in self.nodes:
                return self.nodes[node]
            else:
                return False

    def getFlattenedNode(self, variable_name: str):
        """
        Return the CausalNode in the flattened graph with name variable_name.
        """
        for grouped_node in self.nodes.values():
            node = grouped_node.graph.getNode(variable_name)
            if node:
                return node
        # if node could not be found, return false
        return False

    def getGroup(self, node: CausalNode):
        """
        Return the GroupedCausalNode to which node belongs.
        """
        for group_name in self.nodes:
            if (node.name in self.nodes[group_name].graph.nodes):
                return self.nodes[group_name]

    def getParents(self, node: GroupedCausalNode or CausalNode):
        """
        Find the parent nodes of a GroupedCausalNode or CausalNode.

        Parameters
        ----------
        node: GroupedCausalNode | CausalNode

        Return
        ------
        out: list of GroupedCausalNode | list of CausalNode
            If node is a GroupedCausalNode, return the parents of node in
            this GroupedCausalGraph. If node is a CausalNode inside this
            GroupedCausalGraph, return the parents of node in the flattened
            graph.
        """

        # if node is a GroupedCausalNode, find the grouped parents
        if isinstance(node, GroupedCausalNode):
            # get the edges from parents
            incoming_edges = self.getIncomingEdges(node)

            return [edge.from_node for edge in incoming_edges]

        # if node is a CausalNode, find the parents in the flattened graph
        elif isinstance(node, CausalNode):
            # find the GroupedCausalNode that node belongs to
            this_group = self.getGroup(node)

            # collect parent nodes from inside the group and from other groups
            parents = []

            # from this group:
            parents += node.graph.getParents(node)

            # from other groups:
            for other_group in self.getParents(this_group):
                parents += list(other_group.graph.nodes.values())

            return parents

        # if node is not a GroupedCausalNode or CausalNode, raise error
        else:
            raise ValueError(
                "node argument must be a GroupedCausalNode or CausalNode")

    def getStaticDynamicNodes(self):
        """
        Output lists of static and dynamic CausalNode's in the flattened graph.

        Returns
        -------
        out : tuple (list of CausalNode, list of CausalNode)
            Lists of static and dynamic nodes in the flattened graph
        """
        static_nodes = []
        dynamic_nodes = []

        for group in self.nodes.values():
            for node in group.graph.nodes.values():
                if node.isDynamic():
                    dynamic_nodes.append(node)
                elif node.isStatic():
                    static_nodes.append(node)
                else:
                    raise Exception("could not retrieve static/dynamic status of node "
                                    + node.name)

        return (static_nodes, dynamic_nodes)

    def getTemporalCopiesOfParent(self, parent_node: CausalNode, effect_node: CausalNode):
        """
        Compute list of temporal copies of a parent node acting on an effect node.

        For example, if parent_node -1,2-> effect_node and parent_node.name is "Parent",
        then getTemporalCopiesOfParent(parent_node, effect_node) returns the list 
        ["Parent_tm1", "Parent_tm2"].
        """
        if (parent_node.graph.parent is effect_node.graph.parent):
            print(parent_node.graph.parent)
            print(effect_node.graph.parent)
            edge = parent_node.graph.getEdge(parent_node, effect_node)
            if edge:
                time_to_effect = getTimeToEffect(edge)
                return [parent_node.name + "_tm" + str(i) for i in
                        range(time_to_effect['min'], time_to_effect['max']+1)]
            else:
                raise Exception("no edge exists between the two nodes!")
        else:
            # check if group of parent_node has an edge to group of effect_node
            edge = self.getEdge(parent_node.graph.parent,
                                effect_node.graph.parent)
            if edge:
                if isinstance(edge, D2DGroupedCausalEdge):
                    time_to_effect = edge.time_to_effect
                    return [parent_node.name + "_tm" + str(i) for i in
                            range(time_to_effect['min'], time_to_effect['max']+1)]
                else:
                    raise Exception(
                        "edge between groups is not a dynamic-to-dynamic edge!")
            else:
                raise Exception("edge between groups does not exist!")

    def __repr__(self):
        """
        Compute string representation of this GroupedCausalGraph.
        """
        graph2str = "--- Grouped Causal Graph ---\n"
        graph2str += "\nNodes:\n"
        for node_name in self.nodes.keys():
            graph2str += "\t" + node_name + "\n"

        graph2str += "\nEdges:\n"

        for edge_dict in self.edges.values():
            for edge in edge_dict.values():
                graph2str += "\t" + str(edge) + "\n"

        return graph2str
