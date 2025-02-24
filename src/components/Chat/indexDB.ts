import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type IChat = {
    id?: number;
    uid: string;
    askText: string;
    created_at: string;
    role: 'user' | 'assistant';
    status?: 'perform' | 'done';
    isTest?: boolean;
    isImage?: boolean;
    aspectRatio?: `${number}:${number}`;
    paintingModel: string
}

const DB_NAME = 'ai-prompt-expert-chat-database';
const STORE_NAME = 'ai-prompt-expert-chat-store';

interface MyDB extends DBSchema {
    [STORE_NAME]: {
        key: number;
        value: IChat
    };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
    const db = await openDB<MyDB>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
    return db;
}
let db: IDBPDatabase<MyDB> | null = null;

async function getDB(): Promise<IDBPDatabase<MyDB>> {
    if (!db) {
        db = await initDB();
    }
    return db;
}

export async function addData(data: Omit<IChat[], 'id'>): Promise<IChat[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const addPromise = data.map(async (item) => await store.add(item));
    await Promise.all(addPromise)
    await tx.done;
    return await getLsit();
}

export async function deleteData(id: number): Promise<IChat[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).delete(id);
    await tx.done;
    return await getLsit();
}

export async function clearAllChatData(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.clear();
    await tx.done;
}

export async function getLsit(): Promise<IChat[]> {
    const db = await getDB();
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
    const allRecords = await store.getAll();
    // const data = allRecords.sort((a, b) => (b.id || 0) - (a.id || 0))
    return allRecords;
}

export async function updateData(data: IChat): Promise<IChat[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.put(data);
    await tx.done;
    return await getLsit();
}

export async function clearPerformStatusData(): Promise<IChat[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const allRecords = await store.getAll();
    const deletePromises = allRecords
        .filter(record => record.status === 'perform' && record.id !== undefined) // Ensure id is defined
        .map(record => store.delete(record.id!)); // Use non-null assertion operator

    await Promise.all(deletePromises);
    await tx.done;

    return await getLsit();
}

export async function importChatData(data: IChat[]): Promise<IChat[]> {
    const db = await getDB();

    // Clear existing data
    const existingData = await getLsit();
    for (const item of existingData) {
        await deleteData(item.id!);
    }

    // Add new data while preserving IDs
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const item of data) {
        delete item.id;
        await store.add(item); // Use put to preserve the ID
    }
    await tx.done;

    return await getLsit();
}