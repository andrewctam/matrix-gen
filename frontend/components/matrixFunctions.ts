import { Matrices } from "./App";
export const cloneMatrix = (matrix: any[][]) => {
    const clone = new Array(matrix.length).fill(null).map(() => new Array(matrix[0].length).fill(null));
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            clone[i][j] = matrix[i][j];
        }
    }

    return clone;
}

export const generateUniqueName = (matrices: Matrices) => {
    const name = ["A"];
    var willExitFromZ = false;
    var pointer = 0;

    //go from back to front and increment the letter. 
    //if we reach Z, we set it to A and increment the previous letter
    //if we reach the start of the string, pointer == -1, we just had a 
    //Z...Z that converted to A...A, so we add a new letter to start at A...AA
    while (name.join("") in matrices) { //go until name is unique
        while (true) {

            if (pointer < 0) { //reached start of string
                name.push("@"); //'A' - 1, will be incremeneted to 'A' after loop breaks
                pointer = name.length - 1; //go to end of string
                break;
            } else if (name[pointer] === "Z") { //found a Z. we can't increment it so set to A and go backwards.
                name[pointer] = "A";
                pointer--;
                willExitFromZ = true;
            } else  //not a Z and not -1, so we can increment it
                break;
        }

        //increment the char at pointer
        name[pointer] = String.fromCharCode(name[pointer].charCodeAt(0) + 1);

        if (willExitFromZ) { //if we exited from a Z, go to end of string and start going backwards again
            pointer = name.length - 1;
            willExitFromZ = false;
        }
    }

    return name.join("");

}

export const resizeMatrix = (matrix: string[][], rows: number, cols: number) => {
    if (rows <= 1 || cols <= 1) { //actually inputted 0 x 0, which is 1 x 1
        return null;
    }

    if (rows > 101)
        rows = 101;
    if (cols > 101)
        cols = 101;

    //get the smaller of each dimension in case new > old
    const lessRows = Math.min(rows, matrix.length)
    const lessCols = Math.min(cols, matrix[0].length)

    const resized = Array(rows).fill(null)
    for (let i = 0; i < lessRows - 1; i++) { //fill in the rows up to the smaller of the two
        const row = Array(cols).fill("")

        for (let j = 0; j < lessCols - 1; j++) { //fill in the columns up to the smaller of the two
            row[j] = matrix[i][j]
        }

        for (let j = lessCols - 1; j < cols; j++) { //fill in the rest of the columns with empty strings
            row[j] = "";
        }

        resized[i] = row;
    }

    //fill in rest of row with empty strings
    for (let i = lessRows - 1; i < rows; i++)
        resized[i] = Array(cols).fill("");

    return resized;
}

export const deleteRowCol = (matrix: string[][], row: number | undefined, col: number | undefined) => {
    //Can not delete the red row/column
    if (row === matrix.length - 1 || col === matrix[0].length - 1)
        return null;

    const clone = cloneMatrix(matrix);

    if (matrix.length > 2 && row !== undefined) {
        clone.splice(row, 1); //delete row
    }

    if (matrix[0].length > 2 && col !== undefined) {
        for (let i = 0; i < clone.length; i++) {
            clone[i].splice(col, 1); //delete col
        }
    }

    return clone;
}



export const updateEntry = (matrix: string[][], i: number, j: number, value: string, mirror: boolean) => {
    //does not make a clone to prevent unnecessary cloning if we use multiple functions 
    if (mirror) {
        //add enough rows/cols in order to update the correct  j, i

        if (i >= matrix[0].length - 1 && j >= matrix.length - 1) {
            matrix = addRowsAndCols(matrix, j - matrix.length + 2, i - matrix[0].length + 2)
        } else if (j >= matrix.length - 1) {
            matrix = addRows(matrix, j - matrix.length + 2)
        } else if (i >= matrix[0].length - 1) {
            matrix = addCols(matrix, i - matrix[0].length + 2)
        }

        matrix[j][i] = value;
    }

    matrix[i][j] = value;

    return matrix
}

export const addCols = (matrix: string[][], numToAdd: number, pos?: number) => {
    if (pos === undefined)
        pos = matrix[0].length - 1;

    //does not make a clone to prevent unnecessary cloning if we use multiple functions 
    for (let i = 0; i < matrix.length; i++) {
        for (let j = pos; j < pos + numToAdd; j++)
            //Add ""s to each row
            matrix[i].splice(j, 0, "");
    }

    return matrix;
}

export const addRows = (matrix: string[][], numToAdd: number, pos?: number) => {
    if (pos === undefined)
        pos = matrix.length - 1;


    //does not make a clone to prevent unnecessary cloning if we use multiple functions 
    for (let i = pos; i < pos + numToAdd; i++) {
        matrix.splice(i, 0, Array(matrix[0].length).fill(""));
    }

    return matrix;
}

export const addRowsAndCols = (matrix: string[][], rowsToAdd: number, colsToAdd: number) => {
    //does not make a clone to prevent unnecessary cloning if we use multiple functions 
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < colsToAdd; j++)
            matrix[i].push("");
    }

    for (let i = 0; i < rowsToAdd; i++)
        matrix.push(new Array(matrix[0].length).fill(""));

    return matrix;
}

//functions related to matrix actions
export const mirrorRowsCols = (matrix: string[][], mirrorRowsToCols: boolean) => {
    let clone = cloneMatrix(matrix);
    if (matrix.length > matrix[0].length) { //more rows than cols 
        clone = addCols(clone, matrix.length - matrix[0].length);

    } else if (matrix.length < matrix[0].length) {
        clone = addRows(clone, matrix[0].length - matrix.length)
    }

    for (let row = 0; row < matrix.length; row++) {
        for (let col = row + 1; col < matrix.length; col++) {
            if (mirrorRowsToCols)
                clone[col][row] = clone[row][col];
            else //mirrorColsToRows
                clone[row][col] = clone[col][row];

        }
    }

    return clone;
}

export const transpose = (matrix: string[][]) => {
    const transposed = new Array(matrix[0].length).fill(null);

    for (let i = 0; i < transposed.length; i++) {
        const row = new Array(matrix.length).fill(0);
        for (let j = 0; j < row.length; j++)
            row[j] = matrix[j][i];
        transposed[i] = row;
    }

    return transposed;
}

export const randomMatrix = (matrix: string[][], randomLow: number, randomHigh: number) => {
    if (isNaN(randomLow) || isNaN(randomHigh)) {
        return null;
    }

    if (randomLow > randomHigh) {
        return null;
    }

    const clone = cloneMatrix(matrix)

    for (let i = 0; i < clone.length - 1; i++)
        for (let j = 0; j < clone[0].length - 1; j++)
            clone[i][j] = (Math.floor(Math.random() * (randomHigh - randomLow)) + randomLow).toString();

    return clone;
}

export const scatter = (matrix: string[][], scatterLow: number, scatterHigh: number) => {

    if (isNaN(scatterLow) || isNaN(scatterHigh)) {
        return null;
    }

    if (scatterLow > scatterHigh) {
        return null;
    }

    const clone = cloneMatrix(matrix)

    for (let i = scatterLow; i <= scatterHigh; i++) {
        let randomRow = Math.floor(Math.random() * (clone.length - 1));
        let randomCol = Math.floor(Math.random() * (clone[0].length - 1));

        clone[randomRow][randomCol] = i;
    }

    return clone
}

export const shuffle = (matrix: string[][]) => {
    const clone = cloneMatrix(matrix);

    for (let i = 0; i < clone.length - 1; i++) {
        for (let j = 0; j < clone[0].length - 1; j++) {
            const randRow = Math.floor(Math.random() * (clone.length - 1));
            const randCol = Math.floor(Math.random() * (clone[0].length - 1));
            const temp = clone[i][j];
            clone[i][j] = clone[randRow][randCol];
            clone[randRow][randCol] = temp;
        }
    }

    return clone
}



export const reshapeMatrix = (matrix: string[][], rowCount: number, colCount: number) => {
    const numElements = (matrix.length - 1) * (matrix[0].length - 1);
    if (isNaN(rowCount) || isNaN(colCount)) { //one is empty or NaN
        if (isNaN(rowCount) && isNaN(colCount)) {
            return null;
        } else if (!isNaN(rowCount)) { //infer cols bsed on rows
            if (numElements % rowCount !== 0) {
                return null;
            }

            colCount = numElements / rowCount;
        } else if (!isNaN(colCount)) { //infer rows based on cols
            if (numElements % colCount !== 0) {
                return null;
            }

            rowCount = numElements / colCount;
        }
    }
    if (rowCount <= 0 || colCount <= 0) {
        return null;
    }

    const reshaped = Array(rowCount + 1).fill([]).map(() => Array(colCount + 1).fill(""))

    //pointers for reshaped matrix
    var reshapedI = 0;
    var reshapedJ = 0;


    //iterate through matrix and copy to reshaped
    for (let i = 0; i < matrix.length - 1; i++) {
        for (let j = 0; j < matrix[0].length - 1; j++) {
            if (reshapedJ >= colCount) { //last col
                reshapedJ = 0; //wrap back to first col
                reshapedI++;
            }

            if (reshapedI >= rowCount)
                break; //reached end of reshaped matrix

            reshaped[reshapedI][reshapedJ] = matrix[i][j];

            reshapedJ++;
        }
        if (reshapedI >= rowCount)
            break;
    }

    return reshaped

}

export const fillEmpty = (matrix: string[][], fillEmptyWithThis: string) => {
    const clone = cloneMatrix(matrix)

    for (let i = 0; i < clone.length - 1; i++)
        for (let j = 0; j < clone[0].length - 1; j++) {
            if (clone[i][j] === "")
                clone[i][j] = fillEmptyWithThis;
        }

    return clone;
}


export const fillXY = (matrix: string[][], X: string, Y: string) => {
    const clone = cloneMatrix(matrix)

    for (let i = 0; i < clone.length - 1; i++)
        for (let j = 0; j < clone[0].length - 1; j++) {
            if (clone[i][j] === X)
                clone[i][j] = Y;
        }

    return clone;
}

export const fillAll = (matrix: string[][], fill: string) => {
    const clone = cloneMatrix(matrix)

    for (let i = 0; i < clone.length - 1; i++)
        for (let j = 0; j < clone[0].length - 1; j++) {
            clone[i][j] = fill;
        }

    return clone;
}



export const fillDiagonal = (matrix: string[][], fill: string) => {
    const clone = cloneMatrix(matrix)

    const smaller = Math.min(clone.length - 1, clone[0].length - 1);

    for (let i = 0; i < smaller; i++)
        clone[i][i] = fill;

    return clone;
}

export const rotate90Degrees = (matrix: string[][]) => {
    const transposed = transpose(matrix);


    //reverse each row
    for (let i = 0; i < transposed.length - 1; i++) {
        let start = 0;
        let end = transposed[0].length - 2;
        while (start < end) {
            let temp = transposed[i][start];
            transposed[i][start] = transposed[i][end]
            transposed[i][end] = temp;
            start++;
            end--;
        }
    }

    return transposed;


}

export const createIdentity = (size: number) => {
    if (size === null || isNaN(size) || size <= 0)
        return null;

    const matrix = Array(size + 1).fill(null).map(() => Array(size + 1).fill(""))

    for (let i = 0; i < size; i++)
        matrix[i][i] = "1";

    return matrix
}

//functions related to matrix selection
export const editSelection = (matrix: string[][], text: string | number, x1: number, y1: number, x2: number, y2: number) => {

    if (x1 > x2) { //x1 to smaller
        var temp = x1;
        x1 = x2;
        x2 = temp;
    }

    if (y1 > y2) { //y1 to smaller
        temp = y1;
        y1 = y2;
        y2 = temp;
    }

    const clone = cloneMatrix(matrix)

    for (let i = x1; i <= x2; i++)
        for (let j = y1; j <= y2; j++)
            if (text === 8) //backspace
                clone[i][j] = clone[i][j].substring(0, clone[i][j].length - 1); //remove last char
            else
                clone[i][j] += text;

    return clone;
}

export const spliceMatrix = (matrix: string[][], x1: number, y1: number, x2: number, y2: number) => {
    if (x1 > x2) { //x1 to smaller
        var temp = x1;
        x1 = x2;
        x2 = temp;
    }

    if (y1 > y2) { //y1 to smaller
        temp = y1;
        y1 = y2;
        y2 = temp;
    }


    const spliced = Array(x2 - x1 + 2).fill(null).map(() => Array(y2 - y1 + 2).fill("")) //new matrix of appropriate size

    for (let i = x1; i <= x2; i++) //deep copy
        for (let j = y1; j <= y2; j++)
            spliced[i - x1][j - y1] = matrix[i][j];

    return spliced;
}

export const pasteMatrix = (pasteMatrix: string[][], copyMatrix: string[][], x1: number, y1: number, x2: number, y2: number) => {
    if (x1 > x2) { //x1 to smaller
        var temp = x1;
        x1 = x2;
        x2 = temp;
    }

    if (y1 > y2) { //y1 to smaller
        temp = y1;
        y1 = y2;
        y2 = temp;
    }

    if (x2 - x1 + 2 !== copyMatrix.length || y2 - y1 + 2 !== copyMatrix[0].length) {
        return null;
    }

    const clone = cloneMatrix(pasteMatrix)

    for (let i = x1; i <= x2; i++) //paste into matrix
        for (let j = y1; j <= y2; j++)
            clone[i][j] = copyMatrix[i - x1][j - y1];


    return clone;
}


const closeToZero = (n: number) => {
    return Math.abs(n) < 0.000001;
}


export const LUDecomposition = (matrix: number[][]): [number[][] | null, number[][] | null, number] => {
    const size = matrix.length - 1;
    const L: number[][] = new Array(matrix.length).fill(null).map(() => new Array(matrix.length).fill(0));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (i === j)
                L[i][j] = 1;
            else
                L[i][j] = 0;
        }
    }

    const U: number[][] = cloneMatrix(matrix);
    let sign = 1;
    for (let k = 0; k < size - 1; k++) {
        for (let i = k + 1; i < size; i++) {
            if (closeToZero(U[k][k])) {
                //find a non zero pivot to swap with
                for (let j = k + 1; j < size; j++) {
                    if (!closeToZero(U[j][k])) {
                        //swap rows
                        const temp = U[k];
                        U[k] = U[j];
                        U[j] = temp;
                        sign *= -1;
                        break;
                    }
                }
            }

            if (closeToZero(U[k][k])) {
                return [null, null, 0]
            }


            L[i][k] = U[i][k] / U[k][k];
            for (let j = k; j < size; j++) {
                U[i][j] = U[i][j] - L[i][k] * U[k][j];
            }
        }
    }

    return [L, U, sign];
}
export const gaussian = (matrix: number[][]) => {
    const smaller = Math.min(matrix.length - 1, matrix[0].length - 1);
    //divide each row by the pivot
    for (let i = 0; i < smaller; i++) {
        if (closeToZero(matrix[i][i])) {
            //find nonzero pivot and swap
            for (let j = i + 1; j < matrix.length - 1; j++) {
                if (!closeToZero(matrix[j][i])) { //close to 0 for floating point error
                    const temp = matrix[i];
                    matrix[i] = matrix[j];
                    matrix[j] = temp;
                    break;
                }
            }
        }

        if (closeToZero(matrix[i][i]))
            continue;

        const pivot = matrix[i][i];
        for (let j = i; j < matrix[0].length - 1; j++) {
            matrix[i][j] /= pivot;
        }

        for (let j = 0; j < matrix.length - 1; j++) {
            if (j === i)
                continue;

            const ratio = matrix[j][i];
            for (let k = i; k < matrix[0].length - 1; k++) {
                matrix[j][k] -= ratio * matrix[i][k];
                if (closeToZero(matrix[i][i])) {//close to 0 for floating point error
                    matrix[j][k] = 0;
                }
            }
        }
    }

    return matrix

}


export const inverse = (matrix: number[][]) => {
    const clone = cloneMatrix(matrix);
    let size = clone.length - 1;
    //augment matrix with identity matrix
    for (let i = 0; i < size; i++) {
        //add row of 0s
        clone[i].pop();
        clone[i] = clone[i].concat(Array(size).fill(0));
        clone[i][i + size] = 1;
        clone[i].push("")
    }

    //extend last row
    clone[size] = clone[size].concat(Array(size).fill(""));

    return (gaussian(clone).map(row => row.slice(size)));


}