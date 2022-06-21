export interface Position {
    x: number;
    y: number;
}

// positionDiff: compute vector difference to get from A to B
function positionDiff(from_position: Position, to_position: Position) {
    return {
        x: to_position.x - from_position.x,
        y: to_position.y - from_position.y,
    };
}

// computeLength: compute length of position vector
function computeLength(position: Position) {
    return Math.sqrt(position.x ** 2 + position.y ** 2);
}

// positionOnSegment: compute a position along a line segment
function positionOnSegmentEnd(
    from_position: Position,
    to_position: Position,
    s: number
) {
    return {
        x: (s - 1) * (to_position.x - from_position.x),
        y: (s - 1) * (to_position.y - from_position.y),
    };
}

function positionOnSegmentStart(
    from_position: Position,
    to_position: Position,
    s: number
) {
    return {
        x: s * (to_position.x - from_position.x),
        y: s * (to_position.y - from_position.y),
    };
}

// computeEdgeEndpts: computes the endpoints of an edge, so that the edge's
//      arrowhead stops just short of the node's circumference).
export function computeEdgeEndpts(
    from_position: Position,
    to_position: Position,
    node_radius: number
) {
    const dist = computeLength(positionDiff(from_position, to_position));
    const from_endpt = positionOnSegmentStart(
        from_position,
        to_position,
        node_radius / dist
    );
    const to_endpt = positionOnSegmentEnd(
        from_position,
        to_position,
        1 - node_radius / dist
    );
    return [from_endpt, to_endpt];
}
