import { configureStore } from '@reduxjs/toolkit';
import { matricesSlice } from '../features/matrices-slice';
import { settingsSlice } from '../features/settings-slice';

export const store = configureStore({
    reducer: {
        matricesData: matricesSlice.reducer,
        settings: settingsSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;