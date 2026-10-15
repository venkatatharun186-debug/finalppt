const https = require('https');

https.get('https://vision-app-phi.vercel.app/assets/index-BVoeJOEw.js', (res) => {
  let text = '';
  res.on('data', chunk => text += chunk);
  res.on('end', () => {
    // Print all api calls and prompt instructions or tasks
    const tasks = text.match(/task:[^,}]+/g);
    console.log('Tasks:', tasks);
    
    // Find strings containing navigation or modes
    const modeMatches = text.match(/[a-zA-Z0-9_\-]+Mode|[a-zA-Z0-9_\-]+Tab/g);
    console.log('Modes/Tabs:', modeMatches ? Array.from(new Set(modeMatches)) : []);

    // Print all strings in double quotes that are longer than 15 chars and human readable
    const strings = text.match(/`([^`]{15,120})`/g) || [];
    const unique = Array.from(new Set(strings)).filter(s => 
      !s.includes('<svg') && !s.includes('class=') && !s.includes('http') && !s.includes('style=')
    );
    console.log('Total unique strings:', unique.length);
    console.log('Sample strings:');
    unique.slice(0, 40).forEach(s => console.log('  *', s.replace(/\n/g, ' ')));
  });
});
