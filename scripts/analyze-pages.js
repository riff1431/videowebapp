const fs = require('fs');
const path = require('path');

function getFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(full, filter));
    } else if (filter(file)) {
      results.push(full);
    }
  });
  return results;
}

const appDir = path.join(process.cwd(), 'src', 'app');
const pages = getFiles(appDir, f => f === 'page.tsx');

const results = pages.map(p => {
  const content = fs.readFileSync(p, 'utf8');
  const relPath = path.relative(appDir, p).replace(/\\/g, '/');
  
  let route = '/' + relPath.replace(/\/page\.tsx$/, '').replace(/^page\.tsx$/, '');
  route = route.replace(/\/\([^)]+\)/g, '');
  if (!route) route = '/';

  // Check imports of client components in the same folder or components
  const clientMatches = content.match(/import\s+.*?from\s+["'](\.\/[^"']+|@\/components\/[^"']+)["']/g) || [];
  let clientContent = '';
  clientMatches.forEach(m => {
    const importPathMatch = m.match(/from\s+["']([^"']+)["']/);
    if (importPathMatch) {
      let resolved = '';
      const imp = importPathMatch[1];
      if (imp.startsWith('.')) {
        resolved = path.join(path.dirname(p), imp);
      } else if (imp.startsWith('@/')) {
        resolved = path.join(__dirname, 'src', imp.replace(/^@\//, ''));
      }
      for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
        if (fs.existsSync(resolved + ext)) {
          clientContent += '\n' + fs.readFileSync(resolved + ext, 'utf8');
          break;
        }
      }
    }
  });

  const fullContent = content + '\n' + clientContent;

  const usesDirectDb = /from\s+["']@\/db["']/.test(content);
  const usesService = /from\s+["']@\/services/.test(content);
  const usesServerAction = /from\s+["']@\/modules\/.*?\.actions["']/.test(fullContent) || /["']use server["']/.test(content);
  const usesApiFetch = /fetch\s*\(\s*["'`]\/api/.test(fullContent);
  const usesSupabaseStorage = /uploadToSupabaseStorage/.test(fullContent);

  // Detect tables queried if direct db
  const tableMatches = content.match(/db\s*\.\s*(select|insert|update|delete)[\s\S]*?\.from\(([^)]+)\)/g) || [];
  
  let dataSource = [];
  if (usesDirectDb) dataSource.push("Direct Drizzle DB");
  if (usesService) dataSource.push("Service Layer (@/services)");
  if (usesServerAction) dataSource.push("Server Actions");
  if (usesApiFetch) dataSource.push("Internal /api Fetch");
  if (usesSupabaseStorage) dataSource.push("Direct Supabase Storage (Client)");
  if (dataSource.length === 0) dataSource.push("Static / UI-Only");

  // Auth requirement
  const isAuthRequired = /auth\.api\.getSession/.test(content) || 
    /requireAuth/.test(content) || 
    /redirect\(["']\/(login|auth)/.test(content) ||
    /getSession/.test(content) ||
    p.includes('/admin/') ||
    p.includes('\\admin\\') ||
    ['/upload-video', '/create-post', '/create-article', '/create_post', '/create_article', '/dashboard', '/manage-videos', '/liked-videos', '/saved-videos', '/history', '/subscriptions', '/wallet', '/settings', '/edit-video'].some(r => route.startsWith(r));

  return {
    route,
    relPath,
    dataSource: dataSource.join(" + "),
    authRequired: isAuthRequired ? "Yes" : "No"
  };
});

fs.writeFileSync('temp-pages-analysis.json', JSON.stringify(results, null, 2));
console.log('Analyzed', results.length, 'pages.');
