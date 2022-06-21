import { Graph, GraphNode } from "./Graph";

class GroupedGraph {
    nodes: GroupedGraphNode[];
    edges: GroupedGraphEdge[];

    constructor() {
        this.nodes = [];
        this.edges = [];
    }

    addNode(node: GroupedGraphNode) {
        this.nodes.push(node);
        return this;
    }

    addEdge(edge: GroupedGraphEdge) {
        this.edges.push(edge);
        return this;
    }

    edgeExists(
        from_node: GroupedGraphNode,
        to_node: GroupedGraphNode
    ): boolean {
        const checkOneDirection =
            this.edges.filter(
                (edge) =>
                    edge.from_node === from_node && edge.to_node === to_node
            ).length === 1;
        const checkOtherDirection =
            this.edges.filter(
                (edge) =>
                    edge.from_node === to_node && edge.to_node === from_node
            ).length === 1;
        return checkOneDirection || checkOtherDirection;
    }
}

class GroupedGraphNode {
    name: string;
    graph: Graph;
    mode: "dynamic" | "static";
    position: { x: number, y: number };

    constructor(name: string, mode: "dynamic" | "static", position: { x: number, y: number }) {
        this.name = name;
        this.graph = new Graph();
        this.mode = mode;
        this.position = { x: position.x, y: position.y };
    }

    isDynamic(): boolean {
        return (this.mode === "dynamic");
    }

    // return the variables making up this grouped node -- still untested
    getMembers(): string[] {
        return this.graph.nodes.map( (node) => node.name )
    }

    addNode(node: GraphNode) {
        this.graph.addNode(node);
        return this;
    }
}

class GroupedGraphEdge {
    from_node: GroupedGraphNode;
    to_node: GroupedGraphNode;
    time_to_effect: { min: number; max: number } | undefined;

    constructor(
        from_node: GroupedGraphNode,
        to_node: GroupedGraphNode,
        time_to_effect: { min: number; max: number } | undefined
    ) {
        // for a dynamic edge, set default value for time_to_effect if user does not provide it

        this.from_node = from_node;
        this.to_node = to_node;

        if (time_to_effect !== undefined) {
            this.time_to_effect = time_to_effect;
        } else {
            if (from_node.mode === "dynamic" && to_node.mode === "dynamic") {
                this.time_to_effect = { min: 1, max: 1 };
            }
        }
    }

    // Check if edge is between two dynamic nodes
    isDynamic(): boolean {
        return this.from_node.isDynamic() && this.to_node.isDynamic();
    }
}

export { GroupedGraph, GroupedGraphNode, GroupedGraphEdge };
