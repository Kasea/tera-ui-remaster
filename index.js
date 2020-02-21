try {
    delete require.cache[require.resolve("./src/utils.js")];
}catch(e) {}

const utils = require("./src/utils");
const [CreateUI, Handler] = utils.clearModules("./ui", "./handler-manager"); 

module.exports = function TeraUIRemastered(mod) {
    if(!global.TeraProxy.GUIMode) return;
    const {library: {player}} = mod.require;

    const ui = new CreateUI(mod);
    const handler = new Handler(mod, ui);
    let showingUi = false;

    mod.command.add("open", ()=> {
        ui.send("open", true);
    });

    mod.command.add("close", ()=> {
        ui.send("open", null);
    });

    mod.hook("C_SAVE_CLIENT_UI_SETTING", 1, e=> {
        console.log(e);
    });

    const open = () => {
        if(showingUi) return;
        showingUi = true;

        mod.send('S_STEER_DEBUG_COMMAND', 1, { command: "toggleui" });
        ui.send("open", true);
    }

    const close = () => {
        if(!showingUi) return;
        showingUi = false;

		mod.send('S_STEER_DEBUG_COMMAND', 1, { command: "toggleui" });
        ui.send("open", null);
    }

    mod.hook("S_USER_STATUS", 3, e=> {
        if(player.isMe(e.gameId)) {
            if(e.status === 1) open();
            else close();
        }
    });

    this.destructor = () => {
        handler.destructor();
        ui.destructor();
    }
}
