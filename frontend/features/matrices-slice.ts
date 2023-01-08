import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { generateUniqueName, cloneMatrix, addRowsAndCols, addRows, addCols, updateMatrixEntry, deleteMatrixRowCol } from "../components/matrixFunctions"

export type Matrices = { [key: string]: string[][] }

interface MatricesState {
    matrices: Matrices,
    selection: string,
    undoStack: Matrices[],
    redoStack: Matrices[]
}

const initialState: MatricesState = {
    matrices : {"A" : [["", ""], ["", ""]]},
    selection : "A",
    undoStack : [],
    redoStack : []
}

export const matricesSlice = createSlice({
    name: 'matrices',
    initialState,
    reducers: {
        updateSelection: (state: MatricesState, action: PayloadAction<string>) => {
            state.selection = action.payload;
        },
        updateAll: (state: MatricesState, action: PayloadAction<{matrices: Matrices, DO_NOT_UPDATE_UNDO?: boolean}>) => {
            if (!action.payload.DO_NOT_UPDATE_UNDO)
                state.undoStack.push({...state.matrices});

            state.matrices = action.payload.matrices;
        },
        updateMatrix: (state: MatricesState, action: PayloadAction<{matrix: string[][], name: string | undefined}>) => {
            state.undoStack.push({...state.matrices});

            let matrixName = action.payload.name;
            if (matrixName === undefined) {
                matrixName = generateUniqueName(state.matrices);
            }

            state.matrices[matrixName] = action.payload.matrix;
        },

        addRow: (state: MatricesState, action: PayloadAction<{name: string, row: number, col: number, updated: string, pos?: number, mirror: boolean}>) => {
            state.undoStack.push({...state.matrices});
            
            let { name, row, col, updated, pos, mirror } = action.payload;

            let clone = cloneMatrix(state.matrices[action.payload.name]);
            if (action.payload.pos !== undefined) {
                clone = addRows(clone, 1, pos);
            } else if (mirror) {
                const cols = clone[0].length;
                const rows = clone.length
                const max = Math.max(rows + 1, cols)

                clone = addRowsAndCols(clone, max - rows, max - cols);
                clone[col][row] = updated;
            } else {
                clone = addRows(clone, 1);
            }
            
            clone[row][col] = updated;
            state.matrices[name] = clone;
        },
        addCol: (state: MatricesState, action: PayloadAction<{name: string, row: number, col: number, updated: string, pos?: number, mirror: boolean}>) => {
            state.undoStack.push({...state.matrices});

            let { name, row, col, updated, pos, mirror } = action.payload;

            let clone = cloneMatrix(state.matrices[action.payload.name]);
            if (action.payload.pos !== undefined) {
                clone = addCols(clone, 1, pos);
            } else if (mirror) {
                const cols = clone[0].length;
                const rows = clone.length
                const max = Math.max(rows + 1, cols)

                clone = addRowsAndCols(clone, max - rows, max - cols);
                clone[col][row] = updated;
            } else {
                clone = addCols(clone, 1);
            }
            
            clone[row][col] = updated;
            state.matrices[name] = clone;
        },
        addRowAndCol: (state: MatricesState, action: PayloadAction<{name: string, row: number, col: number, updated: string, mirror: boolean}>) => {
            state.undoStack.push({...state.matrices});

            const { name, row, col, updated, mirror } = action.payload;
            let clone = cloneMatrix(state.matrices[name])

                if (mirror) {
                    const cols = clone[0].length;
                    const rows = clone.length
                    const max = Math.max(rows + 1, cols + 1);

                    clone = addRowsAndCols(clone, max - rows, max - cols);
                    clone[col][row] = updated;

                } else {
                    clone = addRowsAndCols(clone, 1, 1);
                }

                clone[row][col] = updated;
                state.matrices[name] = clone;
        },
        deleteRowCol: (state: MatricesState, action: PayloadAction<{name: string, row?: number, col?: number}>) => {
            state.undoStack.push({...state.matrices});

            const { name, row, col } = action.payload;

            let clone = cloneMatrix(state.matrices[name]);
            let deleted = deleteMatrixRowCol(clone, row, col);
            
            if (deleted)
                state.matrices[name] = deleted;
        },
        updateEntry: (state: MatricesState, action: PayloadAction<{name: string, row: number, col: number, updated: string, mirror: boolean}>) => {
            state.undoStack.push({...state.matrices});

            const { name, row, col, updated, mirror } = action.payload;
            const modified = updateMatrixEntry(cloneMatrix(state.matrices[name]), row, col, updated, mirror)
            state.matrices[name] = modified;
        },
        renameMatrix: (state: MatricesState, action: PayloadAction<{oldName: string, newName: string}>) => {
            state.undoStack.push({...state.matrices});

            const { oldName, newName } = action.payload;
            if (oldName === newName || newName in state.matrices) 
                return;

            state.matrices[newName] = state.matrices[oldName];
            delete state.matrices[oldName];
        }, 
        deleteMatrix: (state: MatricesState, action: PayloadAction<string>) => {
            state.undoStack.push({...state.matrices});
            delete state.matrices[action.payload];
        },
        undo: (state: MatricesState) => {
            if (state.undoStack.length > 0) {
                state.redoStack.push(state.matrices);

                state.matrices = state.undoStack.pop() as Matrices;
            }
        },
        redo: (state: MatricesState) => {
            if (state.redoStack.length > 0) {
                state.undoStack.push({...state.matrices});

                state.matrices = state.redoStack.pop() as Matrices;
            }
        },
        clearStacks: (state: MatricesState) => {
            state.undoStack = [];
            state.redoStack = [];
        }
    }

})


export default matricesSlice.reducer;
export const { updateSelection, updateAll, updateMatrix, addRow, addCol, addRowAndCol, updateEntry, renameMatrix, deleteMatrix, undo, redo, deleteRowCol, clearStacks } = matricesSlice.actions;
