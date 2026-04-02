const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/AdminPanel.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replacements to support dark mode
content = content.replace(/bg-cream/g, 'bg-cream dark:bg-slate-950');
content = content.replace(/bg-navy/g, 'bg-navy dark:bg-slate-900');
content = content.replace(/text-cream/g, 'text-cream dark:text-slate-100');
content = content.replace(/bg-white/g, 'bg-white dark:bg-slate-800');
content = content.replace(/text-navy\/30/g, 'text-navy/30 dark:text-slate-500');
content = content.replace(/text-navy\/40/g, 'text-navy/40 dark:text-slate-400');
content = content.replace(/text-navy\/50/g, 'text-navy/50 dark:text-slate-400');
content = content.replace(/text-navy\/60/g, 'text-navy/60 dark:text-slate-300');
content = content.replace(/text-navy(?!\/)/g, 'text-navy dark:text-slate-100');
content = content.replace(/border-black\/5/g, 'border-black/5 dark:border-slate-700');
content = content.replace(/border-black\/10/g, 'border-black/10 dark:border-slate-600');
content = content.replace(/bg-blue-50/g, 'bg-blue-50 dark:bg-blue-900/30');
content = content.replace(/bg-violet-50/g, 'bg-violet-50 dark:bg-violet-900/30');
content = content.replace(/bg-green-50/g, 'bg-green-50 dark:bg-green-900/30');
content = content.replace(/bg-amber-50/g, 'bg-amber-50 dark:bg-amber-900/30');
content = content.replace(/bg-red-50/g, 'bg-red-50 dark:bg-red-900/30');

content = content.replace(/text-blue-600/g, 'text-blue-600 dark:text-blue-400');
content = content.replace(/text-violet-600/g, 'text-violet-600 dark:text-violet-400');
content = content.replace(/text-green-600/g, 'text-green-600 dark:text-green-400');
content = content.replace(/text-amber-600/g, 'text-amber-600 dark:text-amber-400');
content = content.replace(/text-red-600/g, 'text-red-600 dark:text-red-400');

content = content.replace(/text-blue-700/g, 'text-blue-700 dark:text-blue-300');
content = content.replace(/text-violet-700/g, 'text-violet-700 dark:text-violet-300');
content = content.replace(/text-green-700/g, 'text-green-700 dark:text-green-300');
content = content.replace(/text-amber-700/g, 'text-amber-700 dark:text-amber-300');

fs.writeFileSync(file, content, 'utf8');
console.log('Updated AdminPanel.jsx for Dark Mode!');
