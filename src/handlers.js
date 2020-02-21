const { areObjectsTheSame } = require("./utils");

function character_window(mod, ui) {
    const { player } = mod.require.library;
    let previous_data = null;

    const update = () => {
        const data = get_data();
        if(!areObjectsTheSame(data, previous_data)) {
            send_data(data);
        }
    }
    mod.hook("S_LOGIN", "event", {order: 100000}, update);
    mod.hook("S_PLAYER_STAT_UPDATE", "event", {order: 100000}, update);
    mod.hook("S_PLAYER_CHANGE_STAMINA", "event", {order: 100000}, update);
    mod.hook("S_CREATURE_LIFE", "event", {order: 100000}, update);
    mod.hook("S_CREATURE_CHANGE_HP", "event", {order: 100000}, update);
    mod.hook("S_PLAYER_CHANGE_MP", "event", {order: 100000}, update);

    const get_data = () => {
        return {
            alive: player.alive,
            name: player.name,
            level: player.level,
            health: Number(player.health),
            maxHealth: Number(player.maxHealth),
            mana: Number(player.mana),
            maxMana: Number(player.maxMana),
            resource: player.stamina,
            resourceMax: 1500, // TODO: implement properly based on DC
            edge: (player.previous_sPlayerStatUpdate || {}).edge,
            itemLevel: (player.previous_sPlayerStatUpdate || {}).itemLevel
        }
    }

    const send_data = (data) => {
        ui.send("character_window", data);
        previous_data = data;
    }

    this.get = () => {
        try {
            send_data(get_data());
        }catch(e) {
        }
    }
}

function windows(mod, ui) {
    let uis = {};

    mod.hook("C_SAVE_CLIENT_UI_SETTING", 1, e=> {
        uis = e.uis.reduce((a, c)=> ({...a, [c.name]: c}), {});
        ui.send("windows", uis);
    });

    mod.hook("S_REPLY_CLIENT_UI_SETTING", 1, e=> {
        uis = e.uis.reduce((a, c)=> ({...a, [c.name]: c}), {});
        ui.send("windows", uis);
    });

    this.get = async () => {
        ui.send("windows", uis);
    }
    setTimeout(()=> this.get(), 3000);
}

function abnormalities(mod, ui) {
    const filter = {order: 1000, filter: {fake: null}};
    const {library, player} = mod.require.library;

    let iconData = null;
    library.queryF("/AbnormalityIconData")
    .then(data=> {
        iconData = data.children.reduce((acc, val)=> {
            acc[val.attributes.abnormalityId] = val.attributes.iconName;
            return acc;
        }, {});
    }).catch(e=> console.log(e));

    let abnormalities = {};
    // { // testing code
    //     const {effect} = mod.require.library;
    //     abnormalities = Object.entries(Object.assign({}, effect.permanentBuffs, effect.abnormals)).map(([key])=> {
    //         const permanent = effect.hasBuff(key);
    //         return {
    //             id: key,
    //             start: Date.now(),
    //             end: Date.now() + Math.floor(Math.random() * 30000),
    //             stacks: permanent ? 0 : 1,
    //             permanent: permanent
    //         };
    //     }).reduce((acc, data)=> {
    //         acc[data.id] = data;
    //         return acc;
    //     }, {});
    // }

    mod.hook("S_LOGIN", "event", filter, ()=> {
        abnormalities = {};
    })

    const apply = (e) => {
        if(!player.isMe(e.target)) return;
        const now = Date.now();
        abnormalities[e.id] = {
            id: e.id,
            start: now,
            end: e.duration + now,
            stacks: e.stacks,
            permanent: false
        };
        update();
    }
    mod.hook("S_ABNORMALITY_BEGIN", 3, filter, apply);
    mod.hook("S_ABNORMALITY_REFRESH", 1, filter, apply);

    mod.hook("S_ABNORMALITY_END", 1, filter, e=> {
        if(!player.isMe(e.target)) return;

        try {
            delete abnormalities[e.id];
        }catch(e) {}
        update();
    });

    mod.hook("S_HOLD_ABNORMALITY_ADD", 2, filter, e=> {
        abnormalities[e.id] = {
            id: e.id,
            start: Date.now(),
            end: 0,
            stacks: 0,
            permanent: true
        }
        update();
    });

    mod.hook("S_CLEAR_ALL_HOLDED_ABNORMALITY", "event", filter, ()=> {
        Object.entries(abnormalities).forEach((key, data)=> {
            if(data.permanent) {
                delete abnormalities[key];
            }
        });
        update();
    });


    const update = () => {
        const data = getData();
        sendData(data);
    }

    const getData = () => {
        return Object.entries(abnormalities).map(([key, data])=> {
            return {
                icon: iconData[key],
                ...data
            };
        }).sort((a, b)=> a.start - b.start);
    }

    const sendData = (data) => {
        ui.send("abnormalities", data);
    }

    this.get = () => {
        try {
            sendData(getData());
        }catch(e) {

        }
    }
}

const DefaultKeybinds = {
    20: 112,
    21: 113,
    22: 114,
    23: 115,
    24: 116,
    25: 117,
    26: 49,
    27: 50,
    28: 51,
    29: 52,
    30: 53,
    31: 54,
    32: 118,
    33: 119,
    34: 120,
    35: 121,
    36: 122,
    37: 123,
    38: 67,
    39: 88,
    40: 90,
    41: 81,
    42: 69,
    43: 82,
    44: 9998,
    45: 9999,
}

const KeybindsMapper = {
    9: "Tab",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    189: "-",
    238: "Mouse 4",
    239: "Mouse 5",
    9998: "L-Click", // too lazy to get value
    9999: "R-Click", // too lazy to get value
};

function keybinds(mod, ui) {
    const { library: { library } } = mod.require;
    const clientSettings = mod.require["client-settings"];

    const onUpdate = (name) => {
        if(name.includes("CLIENT_USER")) {
            sendData();
        }
    }
    clientSettings.on("update", onUpdate);
    this.destructor = () => {
        clientSettings.off("update", onUpdate);
    }

    let itemIconData = null;
    library.queryF("/ItemData", true, true, true, ["id", "icon"])
    .then(data=> {
        itemIconData = data.children.reduce((acc, val)=> {
            acc[val.attributes.id] = val.attributes.icon;
            return acc;
        }, {});
    }).catch(e=> console.log(e));

    let skillIconData = null;
    library.queryF("/SkillIconData", true, true, true, ["class", "iconName", "skillId"])
    .then(data=> {
        skillIconData = data.children.reduce((acc, val)=> {
            const attr = val.attributes;
            let {class: klass, iconName, skillId} = attr;
            klass = klass.toLowerCase();

            if(!acc[klass]) acc[klass] = {};
            acc[klass][skillId] = iconName;
            return acc;
        }, {});
    }).catch(e=> console.log(e));

    const getIconName = (type, id) => {
        if(type === "SKILL") {
            // probably accurate enough
            return skillIconData[mod.game.me.class.toLowerCase()][id] || skillIconData.common[id] || null;
        } else {
            return itemIconData[id] || null;
        }
    }

    const between = (val, a, b) => val >= a && val <= b;

    const getPrimaryKeybinds = (location, { keys }) => {
        if(location < 50) location += 20;

        for(const key of keys) {
            if(+key.id !== location) {
                continue
            }

            return {
                primaryMod: key.primaryMod ? `${key.primaryMod}+` : "",
                primaryKey: KeybindsMapper[key.primaryKey] || String.fromCharCode(+key.primaryKey)
            }
        }

        const primaryKey = DefaultKeybinds[location];
        if(primaryKey) {
            return {
                primaryMod: "",
                primaryKey: KeybindsMapper[primaryKey] || String.fromCharCode(primaryKey)
            };
        }

        return { primaryMod: "", primaryKey: "" };
    }

    const sendData = () => {
        if(!skillIconData || !itemIconData) return;

        const shortcuts = clientSettings.userSettings.S1ShortCutController;
        const keygroups = clientSettings.userSettings.S1CustomizeKeyGroup;

        const data = (shortcuts.keys || []).map(({windowType, type="ITEM", id, location})=> {
            if(+windowType === 1) return null;

            location = +location;

            const { primaryMod, primaryKey } = getPrimaryKeybinds(location, keygroups)

            // main bar
            if(between(location, 6, 11)) {
                location += 8; // bottom left
            } else if(between(location, 12, 17)) {
                location -= 4; // top right
            } else if(between(location, 18, 23)) {
                location += 4; // bottom right
            } else if(between(location, 24, 25)) {
                location -= 4; // bottom center
            }

            // side bar
            if(between(location, 50, 61)) {
                windowType = 2;
            }

            return {
                icon: getIconName(type, +id),
                window: +windowType,
                type,
                id: +id,
                location,
                primaryMod,
                primaryKey
            };
        });

        ui.send("keybinds", data);
    }

    this.get = async () => {
        do {
            if(!skillIconData || !itemIconData) {
                await new Promise(res=> setTimeout(res, 2000));
                continue;
            }
            try {
                sendData();
                break;
            }catch(e) {
                console.log(e);
                await new Promise(res=> setTimeout(res, 2000));
            }
        } while(true);
    }

    mod.command.add("w", () => {
        this.get();
    });
    setTimeout(this.get, 3000);
}

function cooldowns(mod, ui) {
    const {library: {library}} = mod.require;

    let itemCooldowns = {};
    let skillCooldowns = {};

    const finishCooldown = (type, id) => () => {
        ui.send(`cooldowns-${type}-${id}`, null);
    }

    const sendCooldown = (skill, cooldown, type="skill", start=Date.now()) => {
        if(type === "skill") {
            skill = library.getSkillInfo(skill.id, false);
            clearTimeout((skillCooldowns[skill.id] || {}).timeout);

            if(cooldown <= 0 || Date.now() >= start + cooldown) {
                return finishCooldown("skill", skill.skill)();
            }

            skillCooldowns[skill.id] = {
                start,
                end: start + cooldown,
                timeout: setTimeout(finishCooldown("skill", skill.skill), (start + cooldown) - Date.now())
            }
            ui.send(`cooldowns-skill-${skill.skill}`, skillCooldowns[skill.id]);
        } else {
            cooldown *= 1000;
            clearTimeout((itemCooldowns[skill] || {}).timeout);

            itemCooldowns[skill] = {
                start,
                end: start + cooldown,
                timeout: setTimeout(finishCooldown("item", skill), cooldown)
            }
            ui.send(`cooldowns-item-${skill}`, itemCooldowns[skill]);
        }
    }

    mod.hook("S_DECREASE_COOLTIME_SKILL", 3, e=> {
        sendCooldown(e.skill, e.cooldown, "skill");
    });

    mod.hook("S_START_COOLTIME_SKILL", 3, e=> {
        sendCooldown(e.skill, e.cooldown);
    });

    mod.hook("S_START_COOLTIME_ITEM", 1, e=> {
        sendCooldown(e.item, e.cooldown, "item");
    });

    this.get = () => {}
}

module.exports = {
    character_window,
    windows,
    abnormalities,
    keybinds,
    cooldowns
};
