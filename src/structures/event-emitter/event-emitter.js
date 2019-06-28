class EventEmitter {
    constructor() {
        /** @type { Map.<string, Set<Function>> } */
        this._listeners = new Map();
    }

    /**
     * @param { string } eventName
     * @param { Function } listenerFn
     * @returns { void }
     */
    on(eventName, listenerFn) {
        if (!this._listeners.has(eventName)) {
            this._listeners.set(eventName, new Set());
        }

        const set = this._listeners.get(eventName);
        set && set.add(listenerFn);
    }

    /**
     * @param { string } eventName
     * @param { Function } listenerFn
     * @returns { void }
     */
    off(eventName, listenerFn) {
        if (this._listeners.has(eventName)) {
            const set = this._listeners.get(eventName);
            set && set.delete(listenerFn);
        }
    }

    /**
     * @param { string } eventName
     */
    removeListeners(eventName) {
        if (this._listeners.has(eventName)) {
            const set = this._listeners.get(eventName);
            set && set.clear();
        }

        this._listeners.delete(eventName);
    }

    removeAllListeners() {
        for (let eventName of this._listeners.keys()) {
            this.removeListeners(eventName);
        }
    }

    /**
     * @param { string } type
     * @param { * } params
     * @returns { void }
     */
    emit(type, ...params) {
        if (this._listeners.has(type)) {
            const set = this._listeners.get(type);
            if (set) {
                for (let fn of set.values()) {
                    fn(...params);
                }
            }
        }
    }
}

module.exports = { EventEmitter };
