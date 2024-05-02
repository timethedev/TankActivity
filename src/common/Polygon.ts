function isInsidePolygon(point: [number, number], polygon: [number, number][]): boolean {
    const x = point[0], y = point[1];
    let isInside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];

        const intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }

    return isInside;
}

// Function to generate a random position inside a polygon
function randomPositionInsidePolygon(polygon: [number, number][]): [number, number] | null {
    // Get the bounding box of the polygon
    const minX = Math.min(...polygon.map(point => point[0]));
    const minY = Math.min(...polygon.map(point => point[1]));
    const maxX = Math.max(...polygon.map(point => point[0]));
    const maxY = Math.max(...polygon.map(point => point[1]));

    // Generate random points until one is found inside the polygon
    let tries = 0;
    while (tries < 100) { // limit the number of tries to avoid infinite loops
        const randomX = Math.random() * (maxX - minX) + minX;
        const randomY = Math.random() * (maxY - minY) + minY;
        const randomPoint: [number, number] = [randomX, randomY];

        if (isInsidePolygon(randomPoint, polygon)) {
            return randomPoint;
        }
        tries++;
    }

    return null; // If couldn't find a point after 100 tries
}

export {
    isInsidePolygon,
    randomPositionInsidePolygon
}