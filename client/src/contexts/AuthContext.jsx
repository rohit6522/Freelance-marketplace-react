import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { authService } from "../services/authService";
import { auth, googleProvider, githubProvider } from "../config/firebase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until the first /auth/me check finishes

  // Restore the session from the httpOnly cookie on every page load / refresh
  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const u = await authService.login(payload);
    setUser(u);
    return u;
  }, []);

  const loginWithGoogle = useCallback(async (role) => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const payload = {
      idToken,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      googleId: result.user.uid,
      role,
    };
    const res = await authService.googleAuth(payload);
    if (res?.requiresRole) {
      return { requiresRole: true, payload };
    }
    setUser(res?.user);
    return { user: res?.user };
  }, []);

  const completeGoogleRegistration = useCallback(async (pendingPayload, selectedRole) => {
    const payload = { ...pendingPayload, role: selectedRole };
    const res = await authService.googleAuth(payload);
    setUser(res?.user);
    return res?.user;
  }, []);

  const loginWithGithub = useCallback(async (role) => {
    const result = await signInWithPopup(auth, githubProvider);
    const idToken = await result.user.getIdToken();
    let email = result.user.email || result.user.providerData?.find((p) => p.email)?.email || null;

    // If GitHub user has private email, attempt to retrieve primary verified email with OAuth accessToken
    if (!email) {
      try {
        const credential = GithubAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          const res = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${credential.accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          });
          if (res.ok) {
            const emails = await res.json();
            if (Array.isArray(emails)) {
              const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.primary) || emails[0];
              if (primary?.email) {
                email = primary.email;
              }
            }
          }
        }
      } catch (e) {
        console.warn("Could not retrieve private GitHub email:", e);
      }
    }

    const payload = {
      idToken,
      ...(email ? { email } : {}),
      displayName: result.user.displayName || result.user.providerData?.[0]?.displayName || null,
      photoURL: result.user.photoURL || result.user.providerData?.[0]?.photoURL || null,
      githubId: result.user.uid,
      ...(role ? { role } : {}),
    };
    const res = await authService.githubAuth(payload);
    if (res?.requiresRole) {
      return { requiresRole: true, payload };
    }
    setUser(res?.user);
    return { user: res?.user };
  }, []);

  const completeGithubRegistration = useCallback(async (pendingPayload, selectedRole) => {
    const payload = { ...pendingPayload, role: selectedRole };
    if (!payload.email) delete payload.email;
    const res = await authService.githubAuth(payload);
    setUser(res?.user);
    return res?.user;
  }, []);

  const register = useCallback(async (payload) => {
    const u = await authService.register(payload);
    setUser(u);
    return u;
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    const u = await authService.resetPassword(token, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginWithGoogle,
      completeGoogleRegistration,
      loginWithGithub,
      completeGithubRegistration,
      resetPassword,
      logout,
      setUser,
    }),
    [
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      completeGoogleRegistration,
      loginWithGithub,
      completeGithubRegistration,
      resetPassword,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}