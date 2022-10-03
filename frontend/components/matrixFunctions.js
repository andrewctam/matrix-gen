
export const cloneMatrix = (matrix) => {
    const clone = new Array(matrix.length).fill(null).map(() => new Array(matrix[0].length).fill(null));
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            clone[i][j] = matrix[i][j];
        }
    }

    return clone;   
}

export const generateUniqueName = (matrices) => {
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

export const resizeMatrix = (matrix, rows, cols) => {
    //check to make new and old dimensions are different
    if (matrix.length === rows && matrix[0].length === cols)
        return null;
        
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

export const tryToDelete = (matrix, row, col) => {
    //Can not delete the red row/column
    if (row === matrix.length - 1 || col === matrix[0].length - 1) 
        return null;
        
    const clone = cloneMatrix(matrix);
    var toDelete = true;
    
    //{{1,1,1,1},
    // {0,0,0,0}, row
    // {1,1,1,1}}
    //Try to Delete an Empty Row
    if (matrix.length > 2) {
        for (let i = 0; i < matrix[0].length; i++) {
            if (matrix[row][i] !== "") {
                toDelete = false;
                break;
            }
        }
        if (toDelete)
            clone.splice(row, 1);
    }

    //     col
    //{{1,1,0,1},
    // {1,1,0,1},
    // {1,1,0,1}}
    toDelete = true;
    if (matrix[0].length > 2) {
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i][col] !== "") {
                toDelete = false;
                break;
            }
        }

        if (toDelete) {
            for (let i = 0; i < clone.length; i++) {
                clone[i].splice(col, 1); //delete cols
            } 
        }
    }


    return clone;
}



export const updateEntry = (matrix, i, j, val, mirror) => {
    //does not make a clone to prevent unnecessary cloning if we use multiple functions 
    if (mirror) {
        //add enough rows/cols in order to update the correct  j, i

        if (i >= matrix[0].length - 1 && j >= matrix.length - 1) {
            matrix = addRowsAndCols(matrix, j - matrix.length + 2, i - matrix[0].length + 2, false)
        } else if (j >= matrix.length - 1) {
            matrix = addRows(matrix, j - matrix.length + 2, false)
        } else if (i >= matrix[0].length - 1) {
            matrix = addCols(matrix, i - matrix[0].length + 2, false)
        }
        
        matrix[j][i] = val;
    }

    matrix[i][j] = val;

    return matrix        
}

export const addCols = (matrix, numToAdd) => {
    //does not make a clone to prevent unnecessary cloning if we use multiple functions 
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < numToAdd; j++)
            //Add ""s to each row
            matrix[i].push("");
    }

    return matrix;
}

export const addRows = (matrix, numToAdd) => {
    //does not make a clone to prevent unnecessary cloning if we use multiple functions 
    for (let i = 0; i < numToAdd; i++) {
        matrix.push(new Array(matrix[0].length).fill(""));
    }
    
    return matrix; 
}

export const addRowsAndCols = (matrix, rowsToAdd, colsToAdd) => {
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
export const mirrorRowsCols = (matrix, mirrorRowsToCols) => { 

    if (matrix.length > matrix[0].length) { //more rows than cols 
        matrix = addCols(matrix, matrix.length - matrix[0].length, false);
        
    } else if (matrix.length < matrix[0].length) {
        matrix = addRows(matrix, matrix[0].length - matrix.length, false)  
    }  else {
        matrix = cloneMatrix(matrix)
    }


    for (let row = 0; row < matrix.length; row++) {
        for (let col = row + 1; col < matrix.length; col++) {
            if (mirrorRowsToCols)
                matrix[col][row] = matrix[row][col];
            else //mirrorColsToRows
                matrix[row][col] = matrix[col][row];

        }
    }

    return matrix;
}

export const transpose = (matrix) => {
    const transposed = new Array(matrix[0].length).fill(null);

    for (let i = 0; i < transposed.length; i++) {
        const row = new Array(matrix.length).fill(0);
        for (let j = 0; j < row.length; j++)
            row[j] = matrix[j][i];
        transposed[i] = row;       
    }

    return transposed;
}       

export const randomMatrix = (matrix, randomLow, randomHigh) => {        
    if (randomLow <= randomHigh) {
        const clone = cloneMatrix(matrix)
        
        for (let i = 0; i < clone.length - 1; i++)
            for (let j = 0; j < clone[0].length - 1; j++)
                clone[i][j] = Math.floor(Math.random() * (randomHigh - randomLow)) + randomLow;
        
        return clone;
    }
    else {
        alert("Invalid range")
        return null;
    }

}

export const reshapeMatrix = (matrix, rowCount, colCount) => {
    const numElements = (matrix.length - 1) * (matrix[0].length - 1);
    if (isNaN(rowCount) || isNaN(colCount)) { //one is empty or NaN
        if (isNaN(rowCount) && isNaN(colCount)) {
            alert("Enter rows and columns to reshape");
            return null;
        } else if (!isNaN(rowCount)) { //infer cols bsed on rows
            if (numElements % rowCount !== 0) {
                alert("Invalid number of rows");
                return null;
            }
            
            colCount = numElements / rowCount;
        } else if (!isNaN(colCount)) { //infer rows based on cols
            if (numElements % colCount !== 0) {
                alert("Invalid number of columns");
                return null;
            }
            
            rowCount = numElements / colCount;
        } 
    }


    const reshaped = Array(rowCount + 1).fill([]).map(()=>Array(colCount + 1).fill(""))

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

export const fillEmpty = (matrix, fillEmptyWithThis) => {
    const clone = cloneMatrix(matrix)
    
    for (let i = 0; i < clone.length - 1; i++)
        for (let j = 0; j < clone[0].length - 1; j++) {
            if (clone[i][j] === "")
                clone[i][j] = fillEmptyWithThis;
        }
    
    return clone;
}

export const fillAll = (matrix, fillAllWithThis) => {
    return Array(matrix.length).fill([]).map(()=>
        Array(matrix[0].length).fill(fillAllWithThis)
    );
}

export const fillDiagonal = (matrix, fillDiagonalWithThis) => {
    const clone = cloneMatrix(matrix)
    
    const smaller = Math.min(clone.length - 1,clone[0].length - 1);

    for (let i = 0; i < smaller; i++)
        clone[i][i] = fillDiagonalWithThis;
    
    return clone;    
}

export const createIdentity = (size) => {
    if (size === null || isNaN(size) || size <= 0)
        return null;
        
    const matrix = Array(size + 1).fill().map(()=>Array(size + 1).fill(""))

    for (let i = 0; i < size; i++)
        matrix[i][i] = 1;
    
    return matrix
}

//functions related to matrix selection
export const editSelection = (matrix, text, x1, y1, x2, y2) => {
    
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

export const spliceMatrix = (matrix, x1, y1, x2, y2) => {
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


    const spliced = Array(x2 - x1 + 2).fill().map(()=>Array(y2 - y1 + 2).fill("")) //new matrix of appropriate size

    for (let i = x1; i <= x2; i++) //deep copy
        for (let j = y1; j <= y2; j++)
            spliced[i - x1][j - y1] = matrix[i][j];

    return spliced;
}

export const pasteMatrix = (pasteMatrix, copyMatrix, x1, y1, x2, y2,) => {
   
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

    console.log(pasteMatrix)
    console.log(copyMatrix)
    debugger;

    
    if (x2 - x1 + 2 !== copyMatrix.length || y2 - y1 + 2 !== copyMatrix[0].length) {
        alert("Error: selection dimensions and pasted matrix dimensions must match.")
        return null;
    }

    const clone = cloneMatrix(pasteMatrix)
    
    for (let i = x1; i <= x2; i++) //paste into matrix
        for (let j = y1; j <= y2; j++)
            clone[i][j] = copyMatrix[i - x1][j - y1];
        

    return clone;
}
