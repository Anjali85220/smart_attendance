import { createContext, useContext, useState } from 'react';
import { setToken } from './api';

const Ctx = createContext(null);
export function Provider({ children }){
  const [user,setUser] = useState(null);
  const login = ({ token, faculty })=>{ setToken(token); setUser(faculty); };
  const logout = ()=>{ setToken(''); setUser(null); };
  return <Ctx.Provider value={{user,login,logout}}>{children}</Ctx.Provider>;
}
export const useAuth = ()=>useContext(Ctx);
