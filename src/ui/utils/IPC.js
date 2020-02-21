let _renderer = null;

const useRenderer = () => {
    const [data, setData] = React.useState(null);

    React.useEffect(()=> {
        if(_renderer) {
            setData(_renderer);
            return;
        }

        const { Renderer } = require('tera-mod-ui');
        _renderer = new Renderer;
        setData(_renderer);
        _renderer.send("init");
    }, [setData, _renderer]);

    return data;
}

const sendIPC = async (name, ...args) => {
    while(!_renderer) {
        await new Promise(res=> setTimeout(res, 100));
    }
    console.log("Sent ipc:", name);
    _renderer.send(name, ...args);
}

const useIPCs = (hooks=[]) => {
    const [data, setData] = React.useState({});
    const renderer = useRenderer();

    React.useEffect(()=> {
        if(!renderer) return;

        let callbacks = [];

        for(const hook of hooks) {
            const cb = (data) => {
                setData(prev=> ({...prev, [hook]: data}));
            }
            renderer.on(hook, cb);
            callbacks.push([hook, cb]);
        }

        return ()=> {
            for(const [hook, cb] of callbacks) {
                renderer.off(hook, cb);
            }
        };
    }, [hooks, renderer, setData]);

    return data;
}

const useIPC = (hook="") => {
    const [data, setData] = React.useState(null);
    const renderer = useRenderer();

    React.useEffect(()=> {
        if(!renderer || hook === null) return;
        const cb = (data) => {
            setData(data);
        }
        renderer.on(hook, cb);

        return ()=> {
            renderer.off(hook, cb);
        };
    }, [hook, setData, renderer]);

    return data;
}

module.exports = { useRenderer, sendIPC, useIPCs, useIPC }

