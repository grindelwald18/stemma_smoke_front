import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: () => {
                const state = get();
                return !!state.user && !!state.token;
            },

            login: async (username, password) => {
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const mockUser = {
                        id: 1,
                        username: username,
                        email: `${username}@example.com`,
                        role: 'admin'
                    };

                    const mockToken = 'mock-jwt-token-' + Date.now();

                    set({
                        user: mockUser,
                        token: mockToken
                    });

                    return { success: true, user: mockUser };
                } catch (error) {
                    console.error('Login error:', error);
                    throw error;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null
                });
            },

            updateUser: (userData) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: { ...currentUser, ...userData }
                    });
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token
            })
        }
    )
);

