import { configureStore } from '@reduxjs/toolkit';
import { matricesSlice } from '../features/matrices-slice';

export const store = configureStore({
    reducer: {
        matricesData: matricesSlice.reducer 
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;