class Graph {
    nodes: GraphNode[];
    edges: GraphEdge[];

    constructor() {
        this.nodes = [];
        this.edges = [];
    }

    addNode(node: GraphNode) {
        this.nodes.push(node);
        return this;
    }

    addEdge(edge: GraphEdge) {
        this.edges.push(edge);
        return this;
    }

    edgeExists(from_node: GraphNode, to_node: GraphNode): boolean {
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

class GraphNode {
    name: string;
    mode: "dynamic" | "static";
    position: { x: number; y: number };

    constructor(
        name: string,
        mode: "dynamic" | "static",
        position: { x: number; y: number }
    ) {
        this.name = name;
        this.mode = mode;
        this.position = { x: position.x, y: position.y };
    }

    isDynamic(): boolean {
        return this.mode === "dynamic";
    }
}

class GraphEdge {
    from_node: GraphNode;
    to_node: GraphNode;
    time_to_effect: { min: number; max: number } | undefined;

    constructor(
        from_node: GraphNode,
        to_node: GraphNode,
        time_to_effect: { min: number; max: number } | undefined
    ) {
        // for a dynamic edge, set default value for time_to_effect if user does not provide it

        if (time_to_effect !== undefined) {
            this.time_to_effect = time_to_effect;
        } else {
            if (
                (!time_to_effect) &&
                (from_node.mode === "dynamic") &&
                (to_node.mode === "dynamic")
            ) {
                time_to_effect = { min: 1, max: 1 };
            }
        }

        this.from_node = from_node;
        this.to_node = to_node;
    }

    isDynamic(): boolean {
        return this.from_node.isDynamic() && this.to_node.isDynamic();
    }
}

export { Graph, GraphNode, GraphEdge };
