import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
} from "../api/auth";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const data = await fetchCurrentUser();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function login(email, password) {
    const data = await loginUser({ email, password });
    setUser(data.user);
    return data.user;
  }

  async function register(fullName, email, password, confirmPassword) {
    const data = await registerUser({
      fullName,
      email,
      password,
      confirmPassword,
    });
    console.log(data);

    setUser(data.data.user);
    return data.user;
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {" "}
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
