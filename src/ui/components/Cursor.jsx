
const Cursor = () => {
    const open = useIPC("open");
    if(!open) return null;
    return <div className="cursor" />;
}

