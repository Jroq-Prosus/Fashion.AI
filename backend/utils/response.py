def standard_response(code: int, message: str, data=None):
    return {
        "code": code,
        "message": message,
        "data": data
    }
