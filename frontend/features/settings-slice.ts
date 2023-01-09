import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Settings {
    "Mirror Inputs": boolean
    "Disable Selection": boolean
    "Numbers Only Input": boolean
    "Dark Mode Table": boolean
    "Empty Element": string
    "Decimals To Round": string
}

const initialState: Settings = {
    "Mirror Inputs": false,
    "Disable Selection": false,
    "Numbers Only Input": false,
    "Dark Mode Table": false,
    "Empty Element": "0",
    "Decimals To Round": "2"
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setAllSettings: (state: Settings, action: PayloadAction<Settings>) => {
            state = action.payload;
        },
        updateSetting: (state: Settings, action: PayloadAction<{name: string, value: string}>) => {
            let {name, value} = action.payload;

            switch(name) {
                case "Decimals To Round":
                    if (typeof value !== "string")
                        return;

                    if (value === "") {
                        state[name] = ""
                    } else if (/^\d+$/.test(value)) {
                        state[name] = Math.max(0, Math.min(parseInt(value), 16)).toString();
                    }
                    return;

                case "Empty Element":
                    if (typeof value !== "string")
                        return;

                    state[name] = value;
                    return;

                case "Mirror Inputs":
                case "Disable Selection":
                case "Numbers Only Input":
                case "Dark Mode Table":
                    if (typeof value !== "boolean")
                        return state;

                    state[name] = value;
                    return;

                default: 
                    return;
            }
        },
        toggleSetting: (state: Settings, action: PayloadAction<string>) => {
            switch(action.payload) {
                case "Mirror Inputs":
                case "Disable Selection":
                case "Numbers Only Input":
                case "Dark Mode Table":
                    state[action.payload] = !state[action.payload];
                    return;

                default:
                    return;
            }
        }



    }

})

export default settingsSlice.reducer;

export const { setAllSettings, updateSetting, toggleSetting } = settingsSlice.actions;