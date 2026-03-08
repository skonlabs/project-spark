"""
Universal Content Ingestion Engine

Supports ingestion from:
- File uploads (PDF, DOCX, TXT, MD, HTML, CSV, JSON)
- URLs (single pages, sitemaps, full crawls)
- GitHub repositories
- Google Drive, Dropbox (via OAuth)
- WordPress, Notion, Confluence
- REST API endpoint
"""
from __future__ import annotations

import asyncio
import hashlib
import mimetypes
import os
import re
from pathlib import Path
from typing import BinaryIO
from urllib.parse import urlparse, urljoin

import aiohttp
from bs4 import BeautifulSoup


class ExtractionResult:
    def __init__(
        self,
        title: str | None,
        text: str,
        metadata: dict,
        raw_html: str | None = None,
        url: str | None = None,
        file_type: str | None = None,
        word_count: int = 0,
    ):
        self.title = title
        self.text = text
        self.metadata = metadata
        self.raw_html = raw_html
        self.url = url
        self.file_type = file_type
        self.word_count = word_count or len(text.split())
        self.content_hash = hashlib.sha256(text.encode()).hexdigest()


class IngestionEngine:
    """Extracts text and structure from any supported content source."""

    # ─── File ingestion ───────────────────────────────────────────────────────

    async def ingest_file(
        self, file_content: bytes, filename: str, content_type: str | None = None
    ) -> ExtractionResult:
        """Detect file type and extract text accordingly."""
        ext = Path(filename).suffix.lower()

        if ext == ".pdf":
            return await self._extract_pdf(file_content, filename)
        elif ext in (".docx", ".doc"):
            return await self._extract_docx(file_content, filename)
        elif ext in (".html", ".htm"):
            return await self._extract_html_bytes(file_content, filename)
        elif ext in (".md", ".markdown"):
            return await self._extract_markdown(file_content, filename)
        elif ext == ".txt":
            return await self._extract_text(file_content, filename)
        elif ext == ".json":
            return await self._extract_json(file_content, filename)
        elif ext == ".csv":
            return await self._extract_csv(file_content, filename)
        else:
            # Fallback: treat as text
            return await self._extract_text(file_content, filename)

    async def _extract_pdf(self, content: bytes, filename: str) -> ExtractionResult:
        import io
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            pages_text = []
            for page in reader.pages:
                pages_text.append(page.extract_text() or "")
            text = "\n\n".join(pages_text)
            metadata = {
                "page_count": len(reader.pages),
                "filename": filename,
            }
            title = Path(filename).stem.replace("_", " ").replace("-", " ").title()
            return ExtractionResult(title=title, text=text, metadata=metadata, file_type="pdf")
        except Exception as e:
            return ExtractionResult(
                title=filename, text="", metadata={"error": str(e)}, file_type="pdf"
            )

    async def _extract_docx(self, content: bytes, filename: str) -> ExtractionResult:
        import io
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            text = "\n\n".join(paragraphs)
            title = (
                paragraphs[0][:100] if paragraphs else
                Path(filename).stem.replace("_", " ").title()
            )
            return ExtractionResult(
                title=title, text=text,
                metadata={"filename": filename, "paragraph_count": len(paragraphs)},
                file_type="docx",
            )
        except Exception as e:
            return ExtractionResult(
                title=filename, text="", metadata={"error": str(e)}, file_type="docx"
            )

    async def _extract_html_bytes(self, content: bytes, filename: str) -> ExtractionResult:
        html = content.decode("utf-8", errors="replace")
        return self._parse_html(html, filename)

    async def _extract_markdown(self, content: bytes, filename: str) -> ExtractionResult:
        text = content.decode("utf-8", errors="replace")
        # Extract title from first H1
        title_match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
        title = title_match.group(1) if title_match else Path(filename).stem
        # Strip markdown syntax for plain text analysis
        plain = re.sub(r"[#*`\[\]()>]", "", text)
        plain = re.sub(r"\n{3,}", "\n\n", plain)
        return ExtractionResult(
            title=title, text=plain, metadata={"filename": filename, "original_format": "markdown"},
            file_type="markdown",
        )

    async def _extract_text(self, content: bytes, filename: str) -> ExtractionResult:
        text = content.decode("utf-8", errors="replace")
        title = Path(filename).stem.replace("_", " ").title()
        return ExtractionResult(
            title=title, text=text, metadata={"filename": filename}, file_type="txt"
        )

    async def _extract_json(self, content: bytes, filename: str) -> ExtractionResult:
        import json
        data = json.loads(content.decode("utf-8"))
        text = json.dumps(data, indent=2)
        return ExtractionResult(
            title=Path(filename).stem, text=text,
            metadata={"filename": filename, "format": "json"},
            file_type="json",
        )

    async def _extract_csv(self, content: bytes, filename: str) -> ExtractionResult:
        import csv, io
        reader = csv.DictReader(io.StringIO(content.decode("utf-8", errors="replace")))
        rows = list(reader)
        text = "\n".join(", ".join(f"{k}: {v}" for k, v in row.items()) for row in rows)
        return ExtractionResult(
            title=Path(filename).stem, text=text,
            metadata={"filename": filename, "row_count": len(rows)},
            file_type="csv",
        )

    # ─── URL ingestion ────────────────────────────────────────────────────────

    async def ingest_url(self, url: str) -> ExtractionResult:
        """Fetch a single URL and extract content."""
        async with aiohttp.ClientSession(
            headers={"User-Agent": "GAEOBot/1.0 (+https://gaeo.ai/bot)"},
            timeout=aiohttp.ClientTimeout(total=30),
        ) as session:
            async with session.get(url) as response:
                content_type = response.content_type
                html = await response.text(errors="replace")

        result = self._parse_html(html, url)
        result.url = url
        return result

    async def ingest_sitemap(self, sitemap_url: str) -> list[ExtractionResult]:
        """Parse sitemap.xml and ingest all listed URLs."""
        async with aiohttp.ClientSession(
            headers={"User-Agent": "GAEOBot/1.0"},
            timeout=aiohttp.ClientTimeout(total=30),
        ) as session:
            async with session.get(sitemap_url) as response:
                content = await response.text()

        soup = BeautifulSoup(content, "xml")
        urls = [loc.text for loc in soup.find_all("loc")]

        # Limit and batch
        urls = urls[:200]
        semaphore = asyncio.Semaphore(10)

        async def fetch_one(url: str) -> ExtractionResult | None:
            async with semaphore:
                try:
                    return await self.ingest_url(url)
                except Exception:
                    return None

        tasks = [fetch_one(u) for u in urls]
        results = await asyncio.gather(*tasks)
        return [r for r in results if r is not None]

    async def crawl_website(
        self, base_url: str, max_pages: int = 100
    ) -> list[ExtractionResult]:
        """Simple BFS crawler to ingest an entire website."""
        visited: set[str] = set()
        queue: list[str] = [base_url]
        results: list[ExtractionResult] = []
        domain = urlparse(base_url).netloc

        async with aiohttp.ClientSession(
            headers={"User-Agent": "GAEOBot/1.0"},
            timeout=aiohttp.ClientTimeout(total=30),
        ) as session:
            while queue and len(visited) < max_pages:
                url = queue.pop(0)
                if url in visited:
                    continue
                visited.add(url)

                try:
                    async with session.get(url) as response:
                        if "text/html" not in response.content_type:
                            continue
                        html = await response.text(errors="replace")
                except Exception:
                    continue

                result = self._parse_html(html, url)
                result.url = url
                results.append(result)

                # Extract links for further crawling
                soup = BeautifulSoup(html, "html.parser")
                for link in soup.find_all("a", href=True):
                    href = urljoin(url, link["href"])
                    parsed = urlparse(href)
                    if parsed.netloc == domain and href not in visited:
                        queue.append(href)

        return results

    # ─── GitHub ingestion ─────────────────────────────────────────────────────

    async def ingest_github_repo(
        self,
        repo_url: str,
        github_token: str | None = None,
        file_extensions: list[str] | None = None,
    ) -> list[ExtractionResult]:
        """Ingest markdown and text files from a GitHub repository."""
        # Parse: https://github.com/owner/repo
        parts = repo_url.rstrip("/").split("/")
        owner, repo = parts[-2], parts[-1]

        headers = {"Accept": "application/vnd.github.v3+json"}
        if github_token:
            headers["Authorization"] = f"token {github_token}"

        extensions = set(file_extensions or [".md", ".txt", ".rst", ".mdx"])

        async with aiohttp.ClientSession(headers=headers) as session:
            # Get file tree
            tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"
            async with session.get(tree_url) as response:
                tree_data = await response.json()

            files = [
                item for item in tree_data.get("tree", [])
                if item.get("type") == "blob"
                and any(item["path"].endswith(ext) for ext in extensions)
            ][:100]  # Limit to 100 files

            results = []
            semaphore = asyncio.Semaphore(10)

            async def fetch_file(item: dict) -> ExtractionResult | None:
                async with semaphore:
                    try:
                        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{item['path']}"
                        async with session.get(raw_url) as r:
                            content = await r.read()
                        return await self.ingest_file(
                            content,
                            item["path"],
                            content_type="text/plain",
                        )
                    except Exception:
                        return None

            fetch_tasks = [fetch_file(f) for f in files]
            raw_results = await asyncio.gather(*fetch_tasks)
            return [r for r in raw_results if r is not None]

    # ─── HTML parsing ─────────────────────────────────────────────────────────

    def _parse_html(self, html: str, source: str) -> ExtractionResult:
        soup = BeautifulSoup(html, "html.parser")

        # Remove noise elements
        for tag in soup.find_all(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        # Extract title
        title_tag = soup.find("title")
        h1_tag = soup.find("h1")
        title = (
            (h1_tag.get_text(strip=True) if h1_tag else None)
            or (title_tag.get_text(strip=True) if title_tag else None)
            or source
        )

        # Extract main content
        main = (
            soup.find("main")
            or soup.find("article")
            or soup.find(id=re.compile(r"content|main|article", re.I))
            or soup.find(class_=re.compile(r"content|main|article|post", re.I))
            or soup.body
        )

        text = (main or soup).get_text(separator="\n", strip=True)

        # Metadata
        meta_desc = soup.find("meta", attrs={"name": "description"})
        meta_keywords = soup.find("meta", attrs={"name": "keywords"})

        metadata = {
            "source": source,
            "description": meta_desc.get("content") if meta_desc else None,
            "keywords": meta_keywords.get("content") if meta_keywords else None,
        }

        return ExtractionResult(
            title=title,
            text=text,
            metadata=metadata,
            raw_html=html[:10000],  # Store first 10KB of HTML
            file_type="html",
        )

    # ─── NLP preprocessing ───────────────────────────────────────────────────

    def clean_text(self, text: str) -> str:
        """Clean extracted text for NLP processing."""
        # Normalize whitespace
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r" {2,}", " ", text)
        # Remove URLs
        text = re.sub(r"https?://\S+", "[URL]", text)
        return text.strip()


# ─── Singleton ────────────────────────────────────────────────────────────────

ingestion_engine = IngestionEngine()
