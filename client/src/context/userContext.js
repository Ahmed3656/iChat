import { useState, useEffect, createContext } from "react";

export const UserContext = createContext();

const UserProvider = ({children}) => {
    const [currUser, setCurrUser] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(currUser));
    }, [currUser]);

    return <UserContext.Provider value={{currUser, setCurrUser}}>{children}</UserContext.Provider>
}

export default UserProvider;