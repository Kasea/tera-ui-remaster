import { useIPC } from "./utils/IPC";

const App = () => {
    return (
        <>
            <Abnormalities />
            <Cursor />
            <Profile />
            <SkillBars />
        </>
    );
}


module.exports = { App };
