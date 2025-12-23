
import os
import pytest
import io
import zipfile
import shutil
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def create_zip_content(files):
    """Create a ZIP file in memory from a dictionary of filename -> content."""
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for filename, content in files.items():
            zip_file.writestr(filename, content)
    buffer.seek(0)
    return buffer

@pytest.fixture
def mock_pdflatex():
    """Mock pdflatex availability and execution."""
    with patch("main.check_pdflatex", return_value=True), \
         patch("subprocess.run") as mock_run:
        
        # Configure mock_run to simulate successful compilation and PDF creation
        def side_effect(args, **kwargs):
            # Parse output directory from args or cwd
            # args is like ["pdflatex", ..., tex_file]
            try:
                if "-output-directory" in args:
                    out_dir_idx = args.index("-output-directory") + 1
                    out_dir = args[out_dir_idx]
                else:
                    out_dir = kwargs.get("cwd", ".")
                
                tex_file = args[-1]
                tex_filename = os.path.basename(tex_file)
                pdf_filename = os.path.splitext(tex_filename)[0] + ".pdf"
                pdf_path = os.path.join(out_dir, pdf_filename)
                
                # Create dummy PDF
                with open(pdf_path, "wb") as f:
                    f.write(b"%PDF-1.4\nMock PDF content")
            except (ValueError, IndexError):
                pass
                
            return MagicMock(returncode=0, stdout="Success", stderr="")
            
        mock_run.side_effect = side_effect
        yield mock_run

def test_compile_zip_simple(mock_pdflatex):
    """Test compiling a simple zipped project."""
    tex_content = r"""
    \documentclass{article}
    \begin{document}
    Hello World from ZIP!
    \end{document}
    """
    
    zip_buffer = create_zip_content({
        "main.tex": tex_content
    })
    
    response = client.post(
        "/compile-zip",
        files={"file": ("project.zip", zip_buffer, "application/zip")}
    )
    
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"
    assert "content-disposition" in response.headers
    assert response.content == b"%PDF-1.4\nMock PDF content"

def test_compile_zip_multiple_files_auto_detect(mock_pdflatex):
    """Test compiling a project with multiple files, auto-detecting main.tex."""
    tex_content = r"""
    \documentclass{article}
    \input{chapter1}
    \begin{document}
    Main file.
    \end{document}
    """
    
    chapter1_content = r"Content from chapter 1."
    
    zip_buffer = create_zip_content({
        "main.tex": tex_content,
        "chapter1.tex": chapter1_content
    })
    
    response = client.post(
        "/compile-zip",
        files={"file": ("project.zip", zip_buffer, "application/zip")}
    )
    
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"

def test_compile_zip_explicit_main(mock_pdflatex):
    """Test compiling a project specifying the main file."""
    # File named 'paper.tex' instead of 'main.tex'
    tex_content = r"""
    \documentclass{article}
    \begin{document}
    Explicit main file.
    \end{document}
    """
    
    zip_buffer = create_zip_content({
        "paper.tex": tex_content,
        "other.tex": "garbage"
    })
    
    response = client.post(
        "/compile-zip",
        data={"main_filename": "paper.tex"},
        files={"file": ("project.zip", zip_buffer, "application/zip")}
    )
    
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"

def test_compile_zip_nested(mock_pdflatex):
    """Test compiling a project with nested directory structure."""
    tex_content = r"""
    \documentclass{article}
    \usepackage{graphicx}
    \begin{document}
    Nested test.
    \end{document}
    """
    
    zip_buffer = create_zip_content({
        "src/main.tex": tex_content,
        "img/logo.png": b"fakeimage"
    })
    
    response = client.post(
        "/compile-zip",
        files={"file": ("project.zip", zip_buffer, "application/zip")}
    )
    
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"

def test_compile_zip_invalid(mock_pdflatex):
    """Test uploading a non-zip file."""
    response = client.post(
        "/compile-zip",
        files={"file": ("test.txt", b"not a zip", "text/plain")}
    )
    
    assert response.status_code == 400
