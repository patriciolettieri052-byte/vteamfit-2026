import pandas as pd
import json
import sys

excel_path = r"C:\Users\59892\Desktop\tickets front vteamfit\PLAN EJERCICIOS (5).xlsx"
try:
    df = pd.read_excel(excel_path)
    output = {
        "columns": list(df.columns),
        "first_5_rows": df.head(5).to_dict(orient="records")
    }
    print(json.dumps(output, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}")
