import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { Matrices } from "./matrices-slice";

export interface UserInfo {
    username: string
    accessToken: string
    refreshToken: string
}

export interface User extends UserInfo {
    mergeConflict: boolean
    userMatrices: Matrices | null
    saveToLocal: boolean
}


const initialState: User = {
    username: "",
    accessToken: "",
    refreshToken: "",
    mergeConflict: false,
    userMatrices: null,
    saveToLocal: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser: (state: User, action: PayloadAction<UserInfo>) => {
            state.username = action.payload.username;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;

            localStorage.setItem("username", state.username);
            localStorage.setItem("accessToken", state.accessToken);
            localStorage.setItem("refreshToken", state.refreshToken);
        },
        clearUser: (state: User) => {
            state.username = "";
            state.accessToken = "";
            state.refreshToken = "";

            localStorage.removeItem("username");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
        declareMergeConflict: (state: User, action: PayloadAction<Matrices>) => {
            state.mergeConflict = true;
            console.log(action.payload)
            state.userMatrices = action.payload;
        },
        resolveMergeConflict: (state: User) => {
            state.mergeConflict = false;
            state.userMatrices = null;
        },
        updateSaveToLocal: (state: User, action: PayloadAction<boolean>) => {
            state.saveToLocal = action.payload;
        }

    }
})

export const {updateUser, clearUser, declareMergeConflict, resolveMergeConflict, updateSaveToLocal} = userSlice.actions;
export default userSlice.reducer;