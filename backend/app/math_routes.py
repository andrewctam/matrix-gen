from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .matrix_math import evaluate, processMatrix, LU, QR, SVD, cholesky, inverse, determinant, rref, eigen
import json

router = APIRouter()

class Expression(BaseModel):
    expression: str
    matrices: str
    sparseVal: str
    round: str

class MatrixPayload(BaseModel):
    matrix: str
    sparseVal: str
    round: str

@router.post("/api/math/expression")
async def evaluate_expression(matrix_data: Expression):
    try:
        sparseVal = float(matrix_data.sparseVal)
        round = int(matrix_data.round)
        matrices = json.loads(matrix_data.matrices)

        return {"result": json.dumps(evaluate(matrix_data.expression, sparseVal, matrices, round))}
    except:
        raise HTTPException(status_code = 400, detail = "Error")


def parse_payload(matrix: list, sparseVal: str, round: int):
    try:
        sparseVal = float(sparseVal)
        round = int(round)
        matrix = json.loads(matrix)
        matrix = processMatrix(matrix, sparseVal)

        return (matrix, round)
    except:
        return (None, None)


@router.post("/api/math/LU")
async def calculate_LU(matrix: MatrixPayload):
    matrix, round = parse_payload(matrix.matrix, matrix.sparseVal, matrix.round)
    if (matrix is None or round is None):
        raise HTTPException(status_code = 400, detail = "Error")
    try:
        result = LU(matrix, round)
        return {"result": json.dumps(result)}
    except:
        raise HTTPException(status_code = 400, detail = "Error")

@router.post("/api/math/QR")
async def calculate_QR(matrix: MatrixPayload):
    matrix, round = parse_payload(matrix.matrix, matrix.sparseVal, matrix.round)
    if (matrix is None or round is None):
        raise HTTPException(status_code = 400, detail = "Error")
    try:
        result = QR(matrix, round)
        return {"result": json.dumps(result)}
    except:
        raise HTTPException(status_code = 400, detail = "Error")

@router.post("/api/math/SVD")
async def calculate_SVD(matrix: MatrixPayload):
    matrix, round = parse_payload(matrix.matrix, matrix.sparseVal, matrix.round)
    if (matrix is None or round is None):
        raise HTTPException(status_code = 400, detail = "Error")
    try:
        result = SVD(matrix, round)
        return {"result": json.dumps(result)}
    except:
        raise HTTPException(status_code = 400, detail = "Error")

@router.post("/api/math/cholesky")
async def calculate_cholesky(matrix: MatrixPayload):
    matrix, round = parse_payload(matrix.matrix, matrix.sparseVal, matrix.round)
    if (matrix is None or round is None):
        raise HTTPException(status_code = 400, detail = "Error")
    try:
        result = cholesky(matrix, round)
        return {"result": json.dumps(result)}
    except:
        raise HTTPException(status_code = 400, detail = "Error")


@router.post("/api/math/inverse")
async def calculate_inverse(matrix: MatrixPayload):
    matrix, round = parse_payload(matrix.matrix, matrix.sparseVal, matrix.round)
    if (matrix is None or round is None):
        raise HTTPException(status_code = 400, detail = "Error")
    try:
        result = inverse(matrix, round)
        return {"result": json.dumps(result)}
    except:
        raise HTTPException(status_code = 400, detail = "Error")

@router.post("/api/math/determinant")
async def calculate_determinant(matrix: MatrixPayload):
    matrix, round = parse_payload(matrix.matrix, matrix.sparseVal, matrix.round)
    if (matrix is None or round is None):
        raise HTTPException(status_code = 400, detail = "Error")
    try:
        result = determinant(matrix)
        return {"result": json.dumps(result)}
    except:
        raise HTTPException(status_code = 400, detail = "Error")

@router.post("/api/math/rref")
async def calculate_gaussian(matrix: MatrixPayload):
    matrix, round = parse_payload(matrix.matrix, matrix.sparseVal, matrix.round)
    if (matrix is None or round is None):
        raise HTTPException(status_code = 400, detail = "Error")

    result = rref(matrix, round)
    return {"result": json.dumps(result)}

    raise HTTPException(status_code = 400, detail = "Error")


@router.post("/api/math/eigen")
async def calculate_eigen(matrix: MatrixPayload):
    matrix, round = parse_payload(matrix.matrix, matrix.sparseVal, matrix.round)
    if (matrix is None or round is None):
        raise HTTPException(status_code = 400, detail = "Error")

    result = eigen(matrix, round)
    return {"result": json.dumps(result)}

