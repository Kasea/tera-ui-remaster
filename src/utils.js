
const areObjectsTheSame = (a, b) => {
    if(typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
        return a === b;
    }

    const aEntries = Object.entries(a);
    const bEntries = Object.entries(b);
    if(aEntries.length !== bEntries.length) {
        return false;
    }

    for(const [key, value] of aEntries) {
        if(!areObjectsTheSame(value, bEntries[key])) {
            return false;
        }
    }
    return true;
}

const clearModules = (...modules) => {
    let ret = [];
    modules.forEach(mod=> {
        try {
            delete require.cache[require.resolve(mod)];
        }catch(e) {}
        ret.push(require(mod));
    });
    return ret;
}

module.exports = {
    areObjectsTheSame,
    clearModules
};