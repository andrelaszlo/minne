import { Storage } from '@ionic/storage';

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

/**
 * Stores anything in Ionic Storage.
 *
 * Make a new PersistentObject by passing a Storage instance, the object
 * identifier and a constructor function that will be used when storage
 * is empty, the first time the object is used.
 *
 * Here's a simple counter, starting at 0.
 *
 * ```
 * let number = new PersistentObject<number>(storage, 'my-number', () => 0)
 * number.do(currentValue => currentValue++);
 * ```
 */
export class PersistentObject<T> {
    private storage: Storage;
    private id: string;
    private construct: () => T;
    private STORAGE_PREFIX = 'persistent-object-';

    constructor(storage: Storage, identifier: string, construct: () => T = () => null) {
        this.storage = storage;
        this.id = this.STORAGE_PREFIX + identifier;
        this.construct = construct;
    }

    update(fun: (T) => any): Promise<any> {
        var currentVal;
        return this.get(fun)
            .then(newVal => {
                if (newVal) {
                    console.log("Updating value of", this, newVal);
                    this.storage.set(this.id, newVal);
                } else {
                    console.log("Not updating value of", this, currentVal);
                }
            }).catch(err => console.log("Error in update", err));
    }

    get(fun: (T) => any): Promise<any> {
        return this.storage.get(this.id)
            .then(item => fun(item != null ? item : this.construct()))
            .catch(err => console.log("Error in get", err));
    }

    asPromise(): Promise<T> {
        return this.storage.get(this.id);
    }

}