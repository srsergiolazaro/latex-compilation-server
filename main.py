# latex_server.py - FastAPI server for LaTeX compilation
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
import shutil
import glob
import zipfile
from fastapi.responses import Response
from pydantic import BaseModel
import subprocess
import tempfile
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="LaTeX Compilation Server", version="1.0.0")


class LaTeXRequest(BaseModel):
    content: str
    filename: str = "document"


class CompilationResult(BaseModel):
    success: bool
    message: str
    log: str = ""


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "pdflatex_available": check_pdflatex()}


def check_pdflatex():
    """Check if pdflatex is available"""
    try:
        result = subprocess.run(['pdflatex', '--version'],
                                capture_output=True, text=False, timeout=5)
        return result.returncode == 0
    except:
        return False


@app.post("/compile", response_class=Response)
async def compile_latex(request: LaTeXRequest):
    """
    Compile LaTeX content to PDF
    Returns the PDF file directly as bytes
    """
    if not check_pdflatex():
        raise HTTPException(status_code=500, detail="pdflatex not available")

    # Create temporary directory for compilation
    with tempfile.TemporaryDirectory() as temp_dir:
        tex_file = os.path.join(temp_dir, f"{request.filename}.tex")
        pdf_file = os.path.join(temp_dir, f"{request.filename}.pdf")

        try:
            # Write LaTeX content to file
            logger.info(f"Writing LaTeX content to {tex_file}")
            with open(tex_file, "w", encoding="utf-8") as f:
                f.write(request.content)

            # Compile LaTeX (run twice for references)
            logger.info("Running pdflatex (first pass)")
            result1 = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode",
                    "-output-directory", temp_dir, tex_file],
                capture_output=True, text=False, timeout=30
            )

            stdout = result1.stdout.decode('utf-8', errors='replace')
            stderr = result1.stderr.decode('utf-8', errors='replace')

            if result1.returncode != 0:
                logger.error(f"First pdflatex pass failed: {stderr[:200]}")
                raise HTTPException(
                    status_code=400,
                    detail=f"LaTeX compilation failed: {stdout[:500]} \n {stderr[:500]}"
                )

            # Second pass for references
            logger.info("Running pdflatex (second pass)")
            subprocess.run(
                ["pdflatex", "-interaction=nonstopmode",
                    "-output-directory", temp_dir, tex_file],
                capture_output=True, text=False, timeout=30
            )

            # Check if PDF was created
            if not os.path.exists(pdf_file):
                raise HTTPException(
                    status_code=500, detail="PDF file was not created")

            # Read and return PDF
            logger.info(f"Reading compiled PDF: {pdf_file}")
            with open(pdf_file, "rb") as f:
                pdf_content = f.read()

            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={request.filename}.pdf"}
            )

        except subprocess.TimeoutExpired:
            raise HTTPException(
                status_code=408, detail="LaTeX compilation timeout")
        except Exception as e:
            logger.error(f"Compilation error: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Compilation error: {str(e)}")


@app.post("/compile-zip", response_class=Response)
async def compile_zip(
    file: UploadFile = File(...),
    main_filename: str = Form(None)
):
    """
    Compile a zipped LaTeX project to PDF
    """
    if not check_pdflatex():
        raise HTTPException(status_code=500, detail="pdflatex not available")

    # Validate file extension
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="File must be a ZIP archive")

    with tempfile.TemporaryDirectory() as temp_dir:
        zip_path = os.path.join(temp_dir, "project.zip")
        
        try:
            # Save uploaded ZIP file
            with open(zip_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
            
            # Extract ZIP file
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Find main .tex file
            tex_file = None
            if main_filename:
                possible_path = os.path.join(temp_dir, main_filename)
                if os.path.exists(possible_path):
                    tex_file = possible_path
            
            if not tex_file:
                # smart detection
                tex_files = glob.glob(os.path.join(temp_dir, "**/*.tex"), recursive=True)
                # Filter out files in __MACOSX or hidden directories
                tex_files = [f for f in tex_files if "__MACOSX" not in f and not os.path.basename(f).startswith(".")]

                if not tex_files:
                    raise HTTPException(status_code=400, detail="No .tex files found in ZIP")
                
                # If main.tex exists, use it
                main_candidates = [f for f in tex_files if os.path.basename(f) == "main.tex"]
                if main_candidates:
                    tex_file = main_candidates[0]
                else:
                    # Otherwise use the first one found (naively)
                    tex_file = tex_files[0]
            
            logger.info(f"Compiling {tex_file}")
            
            # Working directory for pdflatex should be the directory containing the tex file
            work_dir = os.path.dirname(tex_file)
            tex_filename = os.path.basename(tex_file)
            
            # Compile (first pass)
            logger.info("Running pdflatex (first pass)")
            result1 = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", tex_filename],
                cwd=work_dir,
                capture_output=True, text=False, timeout=30
            )
            
            stdout = result1.stdout.decode('utf-8', errors='replace')
            stderr = result1.stderr.decode('utf-8', errors='replace')
            
            if result1.returncode != 0:
                logger.error(f"First pdflatex pass failed: {stderr[:200]}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"LaTeX compilation failed: {stdout[:500]} \n {stderr[:500]}"
                )
                
            # Compile (second pass)
            logger.info("Running pdflatex (second pass)")
            subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", tex_filename],
                cwd=work_dir,
                capture_output=True, text=False, timeout=30
            )
            
            # Result PDF path
            pdf_filename = os.path.splitext(tex_filename)[0] + ".pdf"
            pdf_file = os.path.join(work_dir, pdf_filename)
            
            if not os.path.exists(pdf_file):
                raise HTTPException(status_code=500, detail="PDF file was not created")
                
            # Read and return PDF
            with open(pdf_file, "rb") as f:
                pdf_content = f.read()
            
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={pdf_filename}"
                }
            )

        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="Invalid ZIP file")
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=408, detail="LaTeX compilation timeout")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Compilation error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Compilation error: {str(e)}")



@app.post("/compile-status")
async def compile_latex_with_status(request: LaTeXRequest):
    """
    Compile LaTeX and return status/logs instead of PDF file
    Useful for debugging
    """
    if not check_pdflatex():
        return CompilationResult(success=False, message="pdflatex not available")

    with tempfile.TemporaryDirectory() as temp_dir:
        tex_file = os.path.join(temp_dir, f"{request.filename}.tex")
        pdf_file = os.path.join(temp_dir, f"{request.filename}.pdf")

        try:
            # Write LaTeX content
            with open(tex_file, "w", encoding="utf-8") as f:
                f.write(request.content)

            # Compile
            result = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode",
                    "-output-directory", temp_dir, tex_file],
                capture_output=True, text=False, timeout=30
            )

            stdout = result.stdout.decode('utf-8', errors='replace')
            stderr = result.stderr.decode('utf-8', errors='replace')

            pdf_exists = os.path.exists(pdf_file)

            return CompilationResult(
                success=result.returncode == 0 and pdf_exists,
                message=f"Compilation {'successful' if result.returncode == 0 and pdf_exists else 'failed'}",
                log=stdout + "\n" + stderr
            )

        except Exception as e:
            return CompilationResult(success=False, message=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
