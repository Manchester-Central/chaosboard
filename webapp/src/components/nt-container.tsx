import React, { ReactNode } from "react";
import NTManager from "../data/nt-manager";

const ntManager = new NTManager();

export const NtContextObject = React.createContext(ntManager)

type Props = {
    children: ReactNode,
};
function NtContainer({ children }: Props) {
    return (
        <div className="App">
            <NtContextObject.Provider value={ntManager}>
                {children}
            </NtContextObject.Provider>
        </div>
    );
}

export default NtContainer;