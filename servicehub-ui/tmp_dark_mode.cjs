const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk(path.resolve(__dirname, 'src'), function(err, results) {
  if (err) throw err;
  results.filter(f => f.endsWith('.jsx')).forEach(file => {
    let raw = fs.readFileSync(file, 'utf8');
    let mod = raw;

    const rules = [
      { rx: /bg-cream(?!\/\d+)(?!\s*dark:bg-slate-950)/g, rep: 'bg-cream dark:bg-slate-950' },
      { rx: /bg-cream\/50(?!\s*dark:bg-slate-950\/50)(?!\s*dark:hover:bg-slate-700\/50)(?!\s*dark:bg-slate-700\/50)/g, rep: 'bg-cream/50 dark:bg-slate-950/50' },
      { rx: /bg-navy(?!\/\d+)(?!\s*dark:bg-slate-900)(?!\s*dark:bg-slate-800)/g, rep: 'bg-navy dark:bg-slate-900' },
      { rx: /bg-navy\/10(?!\s*dark:bg-slate-800)(?!\s*dark:bg-slate-700)/g, rep: 'bg-navy/10 dark:bg-slate-800' },
      { rx: /bg-navy\/5(?!\s*dark:hover:bg-slate-800)(?!\s*dark:hover:bg-slate-700)/g, rep: 'bg-navy/5 dark:hover:bg-slate-800' },
      { rx: /text-cream(?!\/\d+)(?!\s*dark:text-slate-100)(?!\s*dark:text-white)/g, rep: 'text-cream dark:text-slate-100' },
      { rx: /text-cream\/40(?!\s*dark:text-slate-500)(?!\s*dark:text-slate-400)/g, rep: 'text-cream/40 dark:text-slate-500' },
      { rx: /bg-white(?!\s*dark:bg-slate-800)/g, rep: 'bg-white dark:bg-slate-800' },
      { rx: /border-black\/5(?!\s*dark:border-white\/5)(?!\s*dark:border-slate-700)/g, rep: 'border-black/5 dark:border-slate-700' },
      { rx: /border-black\/10(?!\s*dark:border-white\/10)(?!\s*dark:border-slate-600)(?!\s*dark:border-slate-700)/g, rep: 'border-black/10 dark:border-slate-600' },
      { rx: /text-navy(?!\/\d+)(?!\s*dark:text-white)(?!\s*dark:text-slate-100)/g, rep: 'text-navy dark:text-white' },
      { rx: /text-navy\/20(?!\s*dark:text-slate-500)/g, rep: 'text-navy/20 dark:text-slate-500' },
      { rx: /text-navy\/30(?!\s*dark:text-slate-500)(?!\s*dark:text-slate-400)/g, rep: 'text-navy/30 dark:text-slate-500' },
      { rx: /text-navy\/40(?!\s*dark:text-slate-400)/g, rep: 'text-navy/40 dark:text-slate-400' },
      { rx: /text-navy\/50(?!\s*dark:text-slate-400)/g, rep: 'text-navy/50 dark:text-slate-400' },
      { rx: /text-navy\/60(?!\s*dark:text-slate-300)/g, rep: 'text-navy/60 dark:text-slate-300' },
      { rx: /bg-blue-50(?!\s*dark:bg-blue-900\/40)/g, rep: 'bg-blue-50 dark:bg-blue-900/40' },
      { rx: /bg-violet-50(?!\s*dark:bg-violet-900\/40)/g, rep: 'bg-violet-50 dark:bg-violet-900/40' },
      { rx: /bg-green-50(?!\s*dark:bg-green-900\/40)/g, rep: 'bg-green-50 dark:bg-green-900/40' },
      { rx: /bg-red-50(?!\s*dark:bg-red-900\/40)/g, rep: 'bg-red-50 dark:bg-red-900/40' },
      { rx: /bg-amber-50(?!\s*dark:bg-amber-900\/40)/g, rep: 'bg-amber-50 dark:bg-amber-900/40' },
      { rx: /text-blue-600(?!\s*dark:text-blue-400)/g, rep: 'text-blue-600 dark:text-blue-400' },
      { rx: /text-violet-600(?!\s*dark:text-violet-400)/g, rep: 'text-violet-600 dark:text-violet-400' },
      { rx: /text-green-600(?!\s*dark:text-green-400)/g, rep: 'text-green-600 dark:text-green-400' },
      { rx: /text-amber-600(?!\s*dark:text-amber-400)/g, rep: 'text-amber-600 dark:text-amber-400' },
      { rx: /text-red-600(?!\s*dark:text-red-400)/g, rep: 'text-red-600 dark:text-red-400' },
      { rx: /text-blue-700(?!\s*dark:text-blue-300)/g, rep: 'text-blue-700 dark:text-blue-300' },
      { rx: /text-violet-700(?!\s*dark:text-violet-300)/g, rep: 'text-violet-700 dark:text-violet-300' },
      { rx: /text-green-700(?!\s*dark:text-green-300)/g, rep: 'text-green-700 dark:text-green-300' },
      { rx: /text-amber-700(?!\s*dark:text-amber-300)/g, rep: 'text-amber-700 dark:text-amber-300' },
      { rx: /text-red-700(?!\s*dark:text-red-300)/g, rep: 'text-red-700 dark:text-red-300' },
      { rx: /text-gold(?!\/\d+)(?!\s*dark:text-amber-400)(?!\s*dark:text-amber-500)/g, rep: 'text-gold dark:text-amber-400' },
      { rx: /text-gold\/60(?!\s*dark:text-amber-500\/80)/g, rep: 'text-gold/60 dark:text-amber-500/80' },
      { rx: /bg-gold\/10(?!\s*dark:bg-amber-900\/20)/g, rep: 'bg-gold/10 dark:bg-amber-900/20' },
      { rx: /border-gold\/20(?!\s*dark:border-amber-700\/30)(?!\s*dark:border-amber-500\/20)/g, rep: 'border-gold/20 dark:border-amber-700/30' },
      { rx: /bg-sage(?!\/\d+)(?!\s*dark:bg-emerald-600)/g, rep: 'bg-sage dark:bg-emerald-600/90' },
      { rx: /text-sage(?!\/\d+)(?!\s*dark:text-emerald-500)/g, rep: 'text-sage dark:text-emerald-500' }
    ];

    rules.forEach(rule => { mod = mod.replace(rule.rx, rule.rep); });

    if (mod !== raw) {
      fs.writeFileSync(file, mod, 'utf8');
      console.log('Updated ' + file);
    }
  });
});
