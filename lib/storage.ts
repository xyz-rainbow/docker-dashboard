import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'admin' | 'user';
    phone?: string;
    createdAt: string;
}

export const UserStorage = {
    getAll: (): User[] => {
        try {
            const data = fs.readFileSync(USERS_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    },

    saveAll: (users: User[]) => {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    },

    findByEmail: (email: string): User | undefined => {
        const users = UserStorage.getAll();
        return users.find(u => u.email === email);
    },

    create: async (userData: Omit<User, 'id' | 'createdAt' | 'role'>): Promise<User> => {
        const users = UserStorage.getAll();

        // Check if first user (make admin)
        const isFirstUser = users.length === 0;
        const role = isFirstUser ? 'admin' : 'user';

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            ...userData,
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        UserStorage.saveAll(users);
        return newUser;
    },

    update: (id: string, updates: Partial<User>) => {
        const users = UserStorage.getAll();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            UserStorage.saveAll(users);
            return users[index];
        }
        return null;
    },

    delete: (id: string) => {
        let users = UserStorage.getAll();
        users = users.filter(u => u.id !== id);
        UserStorage.saveAll(users);
    }
};
