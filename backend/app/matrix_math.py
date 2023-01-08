 
import numpy as np
import scipy.linalg as la

def order_of_operations(operator: str):
    if (operator == "+"):
        return 0

    if (operator == "*" or operator == "^"):
        return 1
        
    return -1

def is_number(a):
    return type(a) == int or type(a) == float

def is_None(a): 
    return type(a) == None

def processMatrix(matrix: list, sparseVal: float):
    #remove last row/col
    trim = np.delete(matrix, -1, 0)
    trim = np.delete(trim, -1, 1)

    #replace "" in matrix with sparseVal
    trim[trim == ""] = sparseVal
    
    return trim.astype(float)

#rounds, converts to string maitrx, and pads matrix
def finalize(matrix: np.ndarray, round: int):
    if (round > 0):
        result = matrix.round(round).astype(str)
    else:
        result = matrix.astype(int).astype(str).tolist()
    
    return np.pad(result, ((0, 1), (0, 1)), constant_values = "").tolist()

def evaluate(expression: str, sparseVal: float, matrices: dict, round: int):
    postFix = infix_to_postfix(expression)
    result = evaluate_postfix(postFix, sparseVal, matrices)

    return finalize(result, round)

def infix_to_postfix(infixExpr: str):
    output = []
    stack = []

    start = -1
    end = -1
    parsingLetter = False
    parsingNum = False
    subtractionSeen = False
    lastWasOperator = False

    for i in range(len(infixExpr)):
        char = infixExpr[i]
        if (char == " "): #whitespace
            continue
        elif '0' <= char and char <= "9": #a number
            if (parsingLetter): #found number, but currently parsing a name
                finalName = infixExpr[start:end + 1]

                if (subtractionSeen):
                    finalName = "-" + finalName
                    subtractionSeen = False

                output.append(finalName) #append matrix name

                start = -1 #reset start to indicate new parsing
                parsingLetter = False
                stack.append("*") #append multiplication operator
            
            parsingNum = True
            lastWasOperator = False
                
            if start == -1: #this char is the start of a number
                start = i
                end = i
            else:
                end += 1
            
        else: #some letter
            if ('a' <= char and char <= 'z') or ('A' <= char and char <= 'Z'):
                if (parsingNum): #done parsing a number
                    finalNum = infixExpr[start:end + 1]
                    if (subtractionSeen):
                        finalNum = "-" + finalNum
                        subtractionSeen = False
                    
                    output.append(finalNum)
                    start = -1 #reset start to indicate new parsing
                    parsingNum = False
                    stack.append("*") #append multiplication operator
                
                parsingLetter = True
                lastWasOperator = False

                if start == -1: #start of name
                    start = i
                    end = i
                else:
                    end += 1
                
            else: #an operator, paren, or some random character
                if start != -1: #append final number or letter we finished parsing
                    final = infixExpr[start:end + 1]
                    if (subtractionSeen):
                        final = "-" + final
                        subtractionSeen = False
                    
                    output.append(final)
                    start = -1

                    if (parsingLetter):
                        parsingLetter = False
                    if (parsingNum):
                        if char == "(":
                            stack.append("*") # 2(A + B) -> 2 * (A + B)
                        
                        parsingNum = False
                    

                if char == "(":
                    stack.append(char)

                elif char == ")":
                    while stack[-1] != "(":
                        output.append(stack.pop())

                    stack.pop()

                else:
                    if char == "-":
                        if subtractionSeen:
                            subtractionSeen = False #double negative
                            continue
                        elif lastWasOperator or (len(output) == 0 and len(stack) == 0): #treat as invert (A + -B)
                            subtractionSeen = True
                            continue
                        else:
                            subtractionSeen = True
                            char = "+" #subtraction is addding a negative value
                        
                    else:
                        subtractionSeen = False


                    lastWasOperator = True
                    if len(stack) == 0 or stack[-1] == "(": 
                        stack.append(char)
                    elif (order_of_operations(char) > order_of_operations(stack[-1])):
                        stack.append(char)
                    else:
                        while len(stack) > 0 and order_of_operations(char) <= order_of_operations(stack[-1]):
                            output.append(stack.pop())

                        stack.append(char)


    #at the end of parsing, if we are still parsing a num or letter finish it off
    if (start != -1):
        final = infixExpr[start:end + 1] #final name or num
        if (subtractionSeen):
            final = "-" + final
            subtractionSeen = False
        
        output.append(final)
    

    while len(stack) > 0:
        output.append(stack.pop())
    

    return output





def evaluate_postfix(postFix: str, sparseVal: float, matrices: dict):
        stack = []
        for i in range(len(postFix)):
            char = postFix[i]
            if char == "*":
                    b = stack.pop()
                    a = stack.pop()

                    if is_number(a) or is_number(b): #scalar scalar or scalar matrix multiplication
                        result = a * b
                    else:
                        result = np.matmul(a, b)
                    stack.append(result)
            elif char == "^":
                    b = int(stack.pop())
                    a = stack.pop()

                    if is_number(a) and is_number(b):
                        result = a ** b
                    else:
                        result = np.linalg.matrix_power(a, b)

                    stack.append(result)

            elif char == "+":
                    b = stack.pop()
                    a = stack.pop()

                    if is_number(a) and is_number(b):
                        result = a + b
                    else:
                        result = np.add(a, b)

                    stack.append(result)


            else: #not an operator
                try: #check if its a float
                    num = float(postFix[i])
                    stack.append(num)
                except: #not a float, so name of matrix
                    negative = False

                    if postFix[i][0] == "-":
                        name = postFix[i][1:] #remove negative
                        negative = True
                    else:
                        name = postFix[i]

                    matrix = matrices[name]

                    parsedMatrix = processMatrix(matrix, sparseVal); #replace sparseVals and parse floats

                    if (negative):
                        parsedMatrix *= -1

                    stack.append(parsedMatrix)


        
        if type(stack[0]) != np.ndarray :
            return None
        else:
            return stack[0]
    



def inverse(matrix: np.ndarray,round: int):
    if (np.linalg.det(matrix) <= 0.000000001):
        return None
    else:
        result = np.linalg.inv(matrix)
        result = finalize(result, round)
        return {
            "inv": result
        }

def determinant(matrix: np.ndarray):
    det = np.linalg.det(matrix)
    if det <= 0.000000001:
        return None
    else:
        return det
        

def LU(matrix: np.ndarray, round: int):
    p, l, u = la.lu(matrix)
    print(p)
    print(l)
    print(u)
    p = finalize(p, round)
    l = finalize(l, round)
    u = finalize(u, round)

   
    return {
        "P": p,
        "L": l,
        "U": u
    }

def QR(matrix: np.ndarray, round: int):
    q, r = np.linalg.qr(matrix)
    q = finalize(q, round)
    r = finalize(r, round)

    return {
        "Q": q,
        "R": r
    }

def SVD(matrix: np.ndarray, round: int):
    u, s, vh = np.linalg.svd(matrix)

    sigma = finalize(np.diag(s), round)

    u = finalize(u, round)
    vh = finalize(vh, round)

    return {
        "U": u,
        "S": sigma,
        "V": vh
    }

def eigen(matrix: np.ndarray, round: int):
    w, v = np.linalg.eig(matrix)

    eigenvalues = finalize(np.diag(w), round)

    eigenvectors = finalize(v, round)

    return {
        "eval": eigenvalues,
        "evec": eigenvectors
    }

def cholesky(matrix: np.ndarray, round: int):
    result = np.linalg.cholesky(matrix)
    result = finalize(result, round)
    return {
        "c": result
    }

def rref(matrix: np.ndarray, round: int):    
    size = matrix.shape[0]

    for i in range(size):
        #look for non zero pivot
        if abs(matrix[i][i]) <= 0.00000001:
            for j in range(i + 1, size):
                if abs(matrix[j][i]) >= 0.00000001:
                    matrix[[i, j]] = matrix[[j, i]]

        #do forward elimination
        if abs(matrix[i][i]) >= 0.00000001:
            for j in range(i + 1, size):
                matrix[j] -= matrix[i] * matrix[j][i] / matrix[i][i]

    for i in range(size - 1, -1, -1):
        if abs(matrix[i][i]) >= 0.00000001:
            #divide row by pivot
            matrix[i] /= matrix[i][i]

            #do backward elimination 
            for j in range(i - 1, -1, -1):
                matrix[j] -= matrix[i] * matrix[j][i]
        
    result = finalize(matrix, round)
    return {
        "rref": result
    }
    

    
