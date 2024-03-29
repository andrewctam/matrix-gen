import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateUniqueName, cloneMatrix, addRowsAndCols, addRows, addCols, updateMatrixEntry, deleteMatrixRowCol, editSelection } from "../components/matrixFunctions"

export type Matrices = { [key: string]: string[][] }

type Cell = {x: number, y: number}

export type BoxSelection = {start: Cell, end: Cell} | null

interface MatricesState {
    matrices: Matrices,
    selection: string,
    undoStack: Matrices[],
    redoStack: Matrices[],
    boxSelection: BoxSelection
}

const initialState: MatricesState = {
    matrices: { "A": [["", ""], ["", ""]] },
    selection: "A",
    undoStack: [],
    redoStack: [],
    boxSelection: null
}

export const matricesSlice = createSlice({
    name: 'matrices',
    initialState,
    reducers: {
        updateSelection: (state: MatricesState, action: PayloadAction<string>) => {
            state.selection = action.payload;
        },
        updateAllMatrices: (state: MatricesState, action: PayloadAction<{ matrices: Matrices, DO_NOT_UPDATE_UNDO?: boolean }>) => {
            if (!action.payload.DO_NOT_UPDATE_UNDO)
                state.undoStack.push({ ...state.matrices });

            state.matrices = action.payload.matrices;
        },
        updateMatrix: (state: MatricesState, action: PayloadAction<{ matrix: string[][], name: string | undefined }>) => {
            state.undoStack.push({ ...state.matrices });

            let matrixName = action.payload.name;
            if (matrixName === undefined) {
                matrixName = generateUniqueName(state.matrices);
            }

            state.matrices[matrixName] = action.payload.matrix;
        },

        addRow: (state: MatricesState, action: PayloadAction<{ name: string, row: number, col: number, updated: string, pos?: number, mirror: boolean }>) => {
            state.undoStack.push({ ...state.matrices });

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
        addCol: (state: MatricesState, action: PayloadAction<{ name: string, row: number, col: number, updated: string, pos?: number, mirror: boolean }>) => {
            state.undoStack.push({ ...state.matrices });

            let { name, row, col, updated, pos, mirror } = action.payload;

            let clone = cloneMatrix(state.matrices[action.payload.name]);
            if (action.payload.pos !== undefined) {
                clone = addCols(clone, 1, pos);
            } else if (mirror) {
                const cols = clone[0].length;
                const rows = clone.length
                const max = Math.max(row, cols + 1)

                clone = addRowsAndCols(clone, max - rows, max - cols);
                clone[col][row] = updated;
            } else {
                clone = addCols(clone, 1);
            }

            clone[row][col] = updated;
            state.matrices[name] = clone;
        },
        addRowAndCol: (state: MatricesState, action: PayloadAction<{ name: string, row: number, col: number, updated: string, mirror: boolean }>) => {
            state.undoStack.push({ ...state.matrices });

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
        deleteRowCol: (state: MatricesState, action: PayloadAction<{ name: string, row?: number, col?: number }>) => {
            state.undoStack.push({ ...state.matrices });

            const { name, row, col } = action.payload;

            let clone = cloneMatrix(state.matrices[name]);
            let deleted = deleteMatrixRowCol(clone, row, col);

            if (deleted)
                state.matrices[name] = deleted;
        },
        updateEntry: (state: MatricesState, action: PayloadAction<{ name: string, row: number, col: number, updated: string, mirror: boolean }>) => {
            state.undoStack.push({ ...state.matrices });

            const { name, row, col, updated, mirror } = action.payload;

            let modified
            if (state.boxSelection !== null && (state.boxSelection.start.x !== state.boxSelection.end.x || state.boxSelection.start.y !== state.boxSelection.end.y)) {
                const prevValue = state.matrices[name][state.boxSelection.start.x][state.boxSelection.start.y]
                const lenDiff = updated.length - prevValue.length;
                
                if (lenDiff === 0)
                    return;
                else if (lenDiff < 0) {
                    modified = editSelection(state.matrices[name],
                                                state.boxSelection.start.x,
                                                state.boxSelection.start.y,
                                                state.boxSelection.end.x,
                                                state.boxSelection.end.y,
                                                undefined,
                                                true)
                } else {
                    let difference = "";
                    for (let i = 0; i < updated.length; i++) {
                        if (prevValue.charAt(i) !== updated.charAt(i)) {
                            difference = updated.substring(i, i + lenDiff);
                            break;
                        }
                    }
        
                    modified = editSelection(state.matrices[name],  
                                                state.boxSelection.start.x,
                                                state.boxSelection.start.y,
                                                state.boxSelection.end.x,
                                                state.boxSelection.end.y,
                                                difference, undefined)
                }
            } else {
                modified = cloneMatrix(state.matrices[name])
            }
            modified = updateMatrixEntry(modified, row, col, updated, mirror)

            state.matrices[name] = modified;
        },
        backspaceBoxSelection: (state: MatricesState) => {
            if (!state.boxSelection)
                return;

            state.matrices[state.selection] = editSelection(state.matrices[state.selection],
                                                state.boxSelection.start.x,
                                                state.boxSelection.start.y,
                                                state.boxSelection.end.x,
                                                state.boxSelection.end.y, undefined, true)
        },
        renameMatrix: (state: MatricesState, action: PayloadAction<{ oldName: string, newName: string }>) => {
            state.undoStack.push({ ...state.matrices });

            const { oldName, newName } = action.payload;
            if (oldName === newName || newName in state.matrices)
                return;

            state.matrices[newName] = state.matrices[oldName];
            delete state.matrices[oldName];
        },
        deleteMatrix: (state: MatricesState, action: PayloadAction<string>) => {
            state.undoStack.push({ ...state.matrices });
            delete state.matrices[action.payload];
        },
        undo: (state: MatricesState) => {
            if (state.undoStack.length > 0) {
                state.redoStack.push({ ...state.matrices });

                state.matrices = state.undoStack.pop() as Matrices;
            }
        },
        redo: (state: MatricesState) => {
            if (state.redoStack.length > 0) {
                state.undoStack.push({ ...state.matrices });

                state.matrices = state.redoStack.pop() as Matrices;
            }
        },
        clearStacks: (state: MatricesState) => {
            state.undoStack = [];
            state.redoStack = [];
        },
        loadLocalMatrices: (state: MatricesState) => {
            console.log("Loading from local storage...")
            try {
                const matrices = localStorage.getItem("matrices")
                console.log("Found: " + matrices)
                if (matrices === null)
                    throw new Error("No matrices found in local storage");

                const parsed: Matrices = JSON.parse(matrices);
                if (parsed === null) {
                    throw new Error("No matrices found in local storage");
                } else {
                    state.matrices = parsed

                    const localMatrices = Object.keys(parsed);
                    if (localMatrices.length > 0)
                        state.selection = localMatrices[0];
                    else
                        state.selection = "";
                }

            } catch (error) {
                console.log(error)
                localStorage.removeItem("matrices");
                return initialState;
            }

        },
        setBoxSelectionStart: (state: MatricesState, action: PayloadAction<Cell>) => {
            if (!state.boxSelection)
                return;

            state.boxSelection = {
                start: action.payload,
                end: state.boxSelection.end
            }

        },
        setBoxSelectionEnd: (state: MatricesState, action: PayloadAction<Cell>) => {
            if (!state.boxSelection)
                return;

            state.boxSelection = {
                start: state.boxSelection.start,
                end: action.payload
            }
        },
        setBoxSelection: (state: MatricesState, action: PayloadAction<BoxSelection>) => {
            if (!action.payload)
                return;

            state.boxSelection = {
                start: action.payload.start,
                end: action.payload.end
            }
        },
        clearBoxSelection: (state: MatricesState) => {
            state.boxSelection = null
        }


    }

})


export default matricesSlice.reducer;
export const { updateSelection,
                updateAllMatrices,
                updateMatrix,
                addRow,
                addCol,
                addRowAndCol,
                updateEntry,
                backspaceBoxSelection,
                renameMatrix,
                deleteMatrix,
                undo,
                redo,
                deleteRowCol,
                clearStacks,
                loadLocalMatrices,
                setBoxSelectionStart,
                setBoxSelectionEnd,
                setBoxSelection,
                clearBoxSelection } = matricesSlice.actions;
