import { useIPC } from "./utils/IPC"

const AbnormalityView = (props) => {
    const {
        start,
        end,
        permanent,
        stacks,
        icon
    } = props;
    if(!icon) {
        return null;
    }

    return (
        <div className="abnormality-icon" style={{
            backgroundImage: `url("../../data/icons/${icon}.png")`
        }}>
            {!permanent && (
                <>
                    <Countdown start={start} end={end} />
                    <h6 className="abnormality-stack">{stacks}</h6>
                </>
            )}
        </div>
    );
}

const AbnormalitiesView = ({ abnormalities }) => {
    return (
        <div className="abnormalities reverse-list">
            {abnormalities.map((abnormality, idx)=> (
                <AbnormalityView key={`${idx}-${abnormality.start}`} {...abnormality} />
            ))}
        </div>
    );
}


const Abnormalities = () => {
    const open = useIPC("open");
    const abnormalities = useIPC("abnormalities");
    if(!abnormalities || !open) return null;

    return <AbnormalitiesView abnormalities={abnormalities} />
}

