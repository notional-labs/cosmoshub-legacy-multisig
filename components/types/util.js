export function sortedObject(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sortedObject);
    }
    const sortedKeys = Object.keys(obj).sort();
    const result = {};
    // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
    sortedKeys.forEach((key) => {
        result[key] = sortedObject(obj[key]);
    });
    return result;
}

export function sortedJsonStringify(obj) {
    return JSON.stringify(sortedObject(obj));
}