const getAbsolutePos = (ref, window, halfWidth=false) => {
    if(!ref || !ref.current || !window) {
        return {};
    }

    const ret = {
        position: "absolute",
        left: `calc(${window.x}% - ${ref.current.offsetWidth / (halfWidth ? 2 : 1)}px)`,
        top: `calc(${window.y}% - ${ref.current.offsetHeight}px)`
    }; 

    return ret;
}


const roundToClosestDecimal = (num, decimal=2) => {
    const multiplier = 10 ** decimal;
    return Math.round((num + Number.EPSILON) * multiplier) / multiplier;
}

const convertToTimestamp = (timeleft) => {
    timeleft /= 1000;

    if(timeleft <= 60) return `${roundToClosestDecimal(timeleft, 1)}s`;
    if(timeleft <= 60 * 60) return `${Math.floor(timeleft / 60 % 60)}m`;
    if(timeleft <= 60 * 60 * 24) return `${Math.floor(timeleft / 60 / 60 % 24)}H`;
    return `${Math.floor(timeleft / 60 / 60 / 24)}D`;
}

const CountdownView = ({ component: Component, countdown }) => {
    return <Component className="countdown">{countdown}</Component>
}

const Countdown = (props) => {
    const {
        start,
        end,
        component="h4"
    } = props;
    const [countdown, setCountdown] = React.useState(null);

    React.useEffect(()=> {
        const timer = setInterval(()=> {
            setCountdown(()=> convertToTimestamp(end - Date.now()));
        }, 100);

        return ()=> clearInterval(timer);
    }, [setCountdown, end]);

    return (
        <CountdownView component={component} countdown={countdown} />
    );
}

