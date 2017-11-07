/**
 * Gives you an array of items given either an array or a single item (or nothing).
 * @param items {T | Array<T>} optional array or item
 */
export function asArray<T>(items?: T | Array<T>): Array<T> {
    if (!items) {
        return [];
    } else if (Array.isArray(items)) {
        return items;
    } else {
        return [items];
    }
}

/**
 * Map items in a dictionary to an array.
 * @param dict The dictionary to map
 * @param fun A mapping function, taking a key and the corresponding value. Defaults to mapping to value.
 */
export function mapDictToArray<K, V, R>(dict: any, fun?: (K, V) => R): Array<R> {
    if (!fun) {
        fun = (key, value) => value;
    }
    let result: Array<R> = [];
    for (let key in dict) {
        result.push(fun(key, dict[key]));
    }
    return result;
}

/**
 * Get the keys of a dictionary
 * @param dict A dictionary whose keys will be returned
 */
export function dictionaryKeys(dict: any): Array<any>{
    return mapDictToArray(dict, (k, v) => k);
}