import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import StreamdeckApi from "../api/Streamdeck/StreamdeckApi";
import classes from "./PluginSetup.module.css";
import Backdrop from "./Backdrop";

interface Props {
    sdApi: StreamdeckApi;
    hide: () => void;
}

function PluginSetup({ sdApi, hide }: Props): JSX.Element {
    const [dcsBiosInstallPath, setDcsBiosInstallPath] = useState(sdApi.globalSettings.dcs_bios_install_path);
    const [ports, setPorts] = useState({
        dcs_bios_listener_port: sdApi.globalSettings.dcs_bios_listener_port,
        dcs_bios_send_port: sdApi.globalSettings.dcs_bios_send_port,
        listener_port: sdApi.globalSettings.listener_port || "1725",
        send_port: sdApi.globalSettings.send_port || "26027",
    });
    const [portError, setPortError] = useState("");

    useEffect(() => {
        setDcsBiosInstallPath(sdApi.globalSettings.dcs_bios_install_path);
    }, [sdApi.globalSettings.dcs_bios_install_path])

    useEffect(() => {
        setPorts({
            dcs_bios_listener_port: sdApi.globalSettings.dcs_bios_listener_port,
            dcs_bios_send_port: sdApi.globalSettings.dcs_bios_send_port,
            listener_port: sdApi.globalSettings.listener_port || "1725",
            send_port: sdApi.globalSettings.send_port || "26027",
        });
    }, [sdApi.globalSettings.dcs_bios_listener_port, sdApi.globalSettings.dcs_bios_send_port,
        sdApi.globalSettings.listener_port, sdApi.globalSettings.send_port]);

    function handleConnectionSettingsSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (Object.values(ports).some(port => !/^[0-9]{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
            setPortError("Enter a port between 1 and 65535 for each connection.");
            return;
        }
        setPortError("");
        sdApi.commFns.setGlobalSettings(ports);
    }

    function handleDcsBiosPathInputChange(event: ChangeEvent<HTMLInputElement>) {
        setDcsBiosInstallPath(event.currentTarget.value);
    }

    function handleDcsBiosPathButtonPress() {
        sdApi.commFns.setGlobalSettings("dcs_bios_install_path", dcsBiosInstallPath);
    }

    return (
        <div>
            <div className={classes.popupwindow}>
                <h2>Plugin Setup</h2>
                <div>
                    Installation directory of DCS-BIOS: <br />
                    <input
                        type="text"
                        className={classes.pathInput}
                        value={dcsBiosInstallPath}
                        onChange={handleDcsBiosPathInputChange}
                        onKeyPress={(e) => { (e.key === 'Enter' ? handleDcsBiosPathButtonPress() : null) }}
                    />
                    <button className={classes.btn} onClick={handleDcsBiosPathButtonPress}>Update</button>
                    <p>If you do not have DCS-BIOS installed you can download it and follow the "Quick Setup Guide" from
                        <a href="https://github.com/DCSFlightpanels/dcs-bios"> https://github.com/DCSFlightpanels/dcs-bios</a>
                    </p>
                </div>
                <div>
                    <h3 className={classes.header}>Connection Settings</h3>
                </div>
                <form onSubmit={handleConnectionSettingsSubmit}>
                    <div className={classes.grid}>
                        <span className={classes.label}>IP Address: </span>
                        <input
                            type="text"
                            className={classes.input}
                            value="127.0.0.1"
                            disabled={true}
                        />
                        <span className={classes.label}>Multicast Address: </span>
                        <input
                            type="text"
                            className={classes.input}
                            value="239.255.50.10"
                            disabled={true}
                        />
                    </div>
                    <h4>DCS-BIOS</h4>
                    <div className={classes.grid}>
                        <label className={classes.label} htmlFor="dcs_bios_listener_port">Listener Port:</label>
                        <input id="dcs_bios_listener_port" className={classes.input} type="text" inputMode="numeric"
                            required pattern="[0-9]{1,5}" value={ports.dcs_bios_listener_port}
                            onChange={event => setPorts({ ...ports, dcs_bios_listener_port: event.currentTarget.value })} />
                        <label className={classes.label} htmlFor="dcs_bios_send_port">Sender Port:</label>
                        <input id="dcs_bios_send_port" className={classes.input} type="text" inputMode="numeric"
                            required pattern="[0-9]{1,5}" value={ports.dcs_bios_send_port}
                            onChange={event => setPorts({ ...ports, dcs_bios_send_port: event.currentTarget.value })} />
                    </div>
                    <h4>DCS-ExportScript</h4>
                    <div className={classes.grid}>
                        <label className={classes.label} htmlFor="listener_port">Listener Port:</label>
                        <input id="listener_port" className={classes.input} type="text" inputMode="numeric"
                            required pattern="[0-9]{1,5}" value={ports.listener_port}
                            onChange={event => setPorts({ ...ports, listener_port: event.currentTarget.value })} />
                        <label className={classes.label} htmlFor="send_port">Sender Port:</label>
                        <input id="send_port" className={classes.input} type="text" inputMode="numeric"
                            required pattern="[0-9]{1,5}" value={ports.send_port}
                            onChange={event => setPorts({ ...ports, send_port: event.currentTarget.value })} />
                    </div>
                    <button className={classes.btn} type="submit">Update Connection Settings</button>
                    {portError && <p role="alert">{portError}</p>}
                    <p>Ports must be between 1 and 65535. Match the corresponding ports in your DCS export configuration.</p>
                </form>
                <br />
                <button className="btn" onClick={hide}>Close</button>
            </div>
            <Backdrop onClick={hide} globalScope={true} />
        </div>
    )
}

export default PluginSetup;
