import { useIPC } from "./utils/IPC"

const ResourceBar = ({
    resource,
    maxResource,
    color
}) => {
    const percent = Math.floor(resource / maxResource * 100);

    return (
        <div>
            <div style={{
                backgroundColor: color,
                width: `${percent}%`
            }}>
            <h6>{resource} ({roundToClosestDecimal(resource / maxResource * 100)}%)</h6>
            </div>
        </div>
    );
}

const ProfileView = (props) => {
    const {
        name,
        health,
        maxHealth,
        mana,
        maxMana,
        resource,
        resourceMax : maxResource,
    } = props;

    return (
        <div className="profile-view">
            <ResourceBar resource={health} maxResource={maxHealth} color="red" />
            <ResourceBar resource={mana} maxResource={maxMana} color="blue" />
            <ResourceBar resource={resource} maxResource={maxResource} color="green" />
        </div>
    );
}

const Profile = () => {
    const data = useIPC("character_window");
    const open = useIPC("open");
    if(!data || !open) return null;

    return <ProfileView {...data} />;
}

