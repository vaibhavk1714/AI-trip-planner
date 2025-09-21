/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type TripPayload = {
	Destination: string;
	'Time of Year': string;
	'Travel Duration': string;
	Budget: string;
	'Travel Themes': string;
	Travellers: string;
};

export type TripResult = {
	destination: string;
	overview: string;
	daily: string;
	budget: string;
	final: string;
};

export type TripDoc = {
	id: string;
	payload: TripPayload;
	result: TripResult;
	createdAt?: any;
};

export async function saveTrip(uid: string, payload: TripPayload, result: TripResult) {
	const col = collection(db, 'users', uid, 'trips');
	const ref = await addDoc(col, { payload, result, createdAt: serverTimestamp() });

	return ref.id;
}

export async function listTrips(uid: string): Promise<TripDoc[]> {
	const col = collection(db, 'users', uid, 'trips');
	const q = query(col, orderBy('createdAt', 'desc'));
	const snap = await getDocs(q);

	return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TripDoc, 'id'>) }));
}

export async function deleteTrip(uid: string, id: string): Promise<void> {
	await deleteDoc(doc(db, 'users', uid, 'trips', id));
}
