'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthCtx = {
	user: User | null | undefined;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({ user: undefined, logout: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null | undefined>(undefined);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u) => setUser(u));
		return () => unsub();
	}, []);

	const logout = async () => {
		await signOut(auth);
	};

	return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
