# Contentful to Markdown Exporter

This script exports content from Contentful and converts it into markdown files, organizing them by content type.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your Contentful credentials:
```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
CONTENTFUL_ENVIRONMENT=master
```

## Usage

Run the script:
```bash
node index.js
```

The script will:
1. Connect to your Contentful space
2. Export all content entries (excluding assets)
3. Convert each entry to markdown format
4. Save files in the `content` directory, organized by content type

## Output Structure

The exported content will be organized as follows:
```
content/
  ├── [content-type-1]/
  │   ├── [entry-slug-1].md
  │   └── [entry-slug-2].md
  └── [content-type-2]/
      ├── [entry-slug-3].md
      └── [entry-slug-4].md
```

Each markdown file will contain:
- YAML frontmatter with metadata and fields
- Content body in the 'text' field

## Notes

- The script currently only processes content in the 'en-US' locale
- Assets are skipped in the export
- Each content type gets its own directory
- Files are named using the pageId and the slug of the entry inside a folder based on the slug