require('dotenv').config();
const contentfulExport = require('contentful-export');
const fs = require('fs').promises;
const path = require('path');

const MARKDOWN_DIR = 'content';

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT,
  skipAssets: true, // We only want content, not assets
  saveFile: false, // We'll process the data directly instead of saving to file
};

async function convertToMarkdown(entry) {
  const { fields, sys } = entry;
  let markdown = '---\n';
  
  // Add metadata
  markdown += `contentfulID: ${sys.id}\n`;
  markdown += `createdAt: ${sys.createdAt}\n`;
  markdown += `updatedAt: ${sys.updatedAt}\n`;
  
  // Add fields as frontmatter, excluding specified keys
  const excludedFields = ['text', 'contentType', 'isParent', 'parentTutorial', 'pageId', 'slug'];
  Object.entries(fields).forEach(([key, value]) => {
    // Skip excluded fields
    if (!excludedFields.includes(key)) {
      const fieldValue = value['en-US'];
      markdown += `${key}: ${JSON.stringify(fieldValue)}\n`;
    }
  });
  
  markdown += '---\n\n';
  
  // Add text content after frontmatter
  const content = fields.text?.['en-US'] || '';
  markdown += content;
  
  return markdown;
}

async function exportToMarkdown() {
  try {
    await fs.mkdir(MARKDOWN_DIR, { recursive: true });
    
    console.log('Exporting content from Contentful...');
    const result = await contentfulExport(options);
    
    console.log(`Processing ${result.entries.length} entries...`);
    
    // Group entries by content type
    const entriesByType = result.entries.reduce((acc, entry) => {
      const contentType = entry.sys.contentType.sys.id;
      if (!acc[contentType]) {
        acc[contentType] = [];
      }
      acc[contentType].push(entry);
      return acc;
    }, {});
    
    // Process each content type
    for (const [contentType, entries] of Object.entries(entriesByType)) {
      // Process each entry
      for (const entry of entries) {
        const markdown = await convertToMarkdown(entry);
        
        // Get the slug from the entry fields
        const slug = entry.fields.slug?.['en-US'] || entry.sys.id;
        
        // Remove leading slash if present and split path
        const cleanSlug = slug.replace(/^\//, '');
        const pathParts = cleanSlug.split('/');
        
        // Last part is the filename, rest are directories
        let fileName = pathParts.pop();
        
        // Add pageId to filename if it exists
        const pageId = entry.fields.pageId?.['en-US'];
        if (pageId) {
          fileName = `${pageId} ${fileName}`;
        }
        fileName = `${fileName}.md`;
        
        // Construct the full directory path including content type and slug directories
        const dirPath = path.join(MARKDOWN_DIR, contentType, ...pathParts);
        
        // Create nested directories
        await fs.mkdir(dirPath, { recursive: true });
        
        // Create full file path
        const filePath = path.join(dirPath, fileName);
        
        await fs.writeFile(filePath, markdown, 'utf8');
      }
      
      console.log(`Processed ${entries.length} entries for content type: ${contentType}`);
    }
    
    console.log('Export completed successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

exportToMarkdown(); 