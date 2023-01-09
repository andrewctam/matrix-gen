import { configureStore } from '@reduxjs/toolkit';
import { matricesSlice } from '../features/matrices-slice';
import { settingsSlice } from '../features/settings-slice';
import { userSlice } from '../features/user-slice';

export const store = configureStore({
    reducer: {
        matricesData: matricesSlice.reducer,
        settings: settingsSlice.reducer,
        user: userSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;