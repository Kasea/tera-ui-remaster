const utils = require("./utils");
const [handlers] = utils.clearModules("./handlers");

module.exports = class HandlerManager {
    constructor(mod, ui) {
        this.mod = mod;
        this.ui = ui;
        this._handlers = [];

        for(const [name, handler] of Object.entries(handlers)) {
            this.addHandler(name, handler);
        }
    }

    addHandler(name, handler) {
        const handle = new handler(this.mod, this.ui);
        this._handlers.push([name, handle]);
        this.ui.on(name, handle.get);
    }

    destructor() {
        for(const [name, handler] of this._handlers) {
            try {
                handler.destructor();
            }catch(e) {}
            this.ui.off(name, handler.get);
        }
        this._handlers = [];
    }
}