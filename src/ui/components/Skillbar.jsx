import { useIPC, sendIPC } from "./utils/IPC"

const SkillView = (props) => {
    const {
        icon,
        keybind,
        cooldown
    } = props;

    if(!icon) return <div className="skill-view" />

    return (
        <div className="skill-view" style={{
            backgroundImage: `url("../../data/icons/${icon}.png")`
        }}>
            <h6 className="skill-view-keybind">{keybind}</h6>
            {cooldown && <Countdown start={cooldown.start} end={cooldown.end} />}
        </div>
    );
}

const Skill = (props) => {
    const {
        icon,
        type="ITEM",
        id=null,
        primaryKey="",
        primaryMod=""
    } = props;

    let ipc = null;

    if(type === "ITEM") {
        ipc = `cooldowns-item-${id}`;
    } else if(type === "SKILL") {
        ipc = `cooldowns-skill-${Math.floor(id / 10000)}`;
    }

    const cooldown = useIPC(ipc);

    return (
        <SkillView
            icon={icon}
            keybind={primaryMod+primaryKey}
            cooldown={cooldown}
        />
    );
}

const SkillBarsView = ({main, sub1, sub2, windows}) => {
    const [, setRefresh] = React.useState(false);
    const leftRef = React.useRef(null);
    const mainRef = React.useRef(null);
    const rightRef = React.useRef(null);

    React.useLayoutEffect(()=> {
        setRefresh(prev=> !prev);
    }, []);

    return (
        <>
            <div ref={leftRef} className="skill-bar skill-bar-mini" style={getAbsolutePos(leftRef, windows.ExtShortCut)}>
                {sub1.map((data, idx)=> <Skill key={idx} {...data} />)}
            </div>

            <div ref={mainRef} className="skill-bar skill-bar-big" style={getAbsolutePos(mainRef, windows.ShortCut, true)}>
                {main.map((data, idx)=> <Skill key={idx} {...data} />)}
            </div>
            
            <div ref={rightRef} className="skill-bar skill-bar-mini" style={getAbsolutePos(rightRef, windows.ExtShortCut2)}>
                {sub2.map((data, idx)=> <Skill key={idx} {...data} />)}
            </div>
        </>
    );
}

const SkillBars = () => {
    const fullData = useIPC("keybinds");
    const windows = useIPC("windows");
    const open = useIPC("open");

    React.useEffect(()=> {
        sendIPC("keybinds");
        sendIPC("windows");
    }, []);

    if(!fullData || !windows || !open) return null;

    const data = fullData.filter(x=> x).sort((a, b)=> a.location - b.location);

    const main = data.filter(x=> x.window === 0).reduce((a, c)=> {
        if(c.location === 8) { // ugly hack which should be removed
            for(let i = 6; i < 8; i++) {
                a.push({
                    icon: null,
                    type: null
                });
            }
        }
        a.push(c);
        return a;
    }, []);
    const sub1 = data.filter(x=> x.window === 2);
    const sub2 = data.filter(x=> x.window === 3);

    return <SkillBarsView main={main} sub1={sub1} sub2={sub2} windows={windows} />;
}

