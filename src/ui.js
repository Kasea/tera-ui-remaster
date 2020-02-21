const { Host } = require('tera-mod-ui');

const releaseCandidate = true;

const defaultOptions = {
    title: "Tera UI Remaster",
    width: releaseCandidate ? 1920 : 1024,
    height: releaseCandidate ? 1080 : 758,
    show: true,
    resizable: true,
    webPreferences: {
        devTools: true,
        nodeIntegration: true
    },
    alwaysOnTop: releaseCandidate,
    // autoHideMenuBar: releaseCandidate,
    frame: !releaseCandidate,
    transparent: releaseCandidate,
    // resizable: !releaseCandidate,
    center: true,
    minimizable: false,
    maximizable: false
};

module.exports = class UI {
    constructor(mod) {
        this.host = new Host(mod, "src/ui/index.html", defaultOptions);
        this._timer = null;
        if(releaseCandidate) {
            this.host.window.setIgnoreMouseEvents(true);
            this._timer = setInterval(()=> {
                this.host.window.setAlwaysOnTop(true);
            }, 1000);
        }
    }

    on = (...args) => {
        this.host.on(...args);
    }

    off = (...args) => {
        this.host.off(...args);
    }

    show = () => {
        this.host.show();
    }

    send = async (...args) => {
        this.host.send(...args);
    }

    destructor = () => {
        this.host.destructor();
        clearInterval(this._timer);
    }
}

