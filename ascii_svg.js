const fs = require('fs');

// Simple point-in-path or polyline sampler for SVG paths
// Even simpler: sample all (x, y) coordinates from the path d strings!
function renderAscii(filename, width = 60, height = 30) {
  const content = fs.readFileSync('public/images/certificate/' + filename, 'utf8');
  const grid = Array.from({ length: height }, () => Array(width).fill(' '));
  
  // Extract all numbers
  const nums = content.match(/-?[0-9]+\.?[0-9]*/g).map(Number);
  
  // Find min/max of valid coords (assume viewBox 0 0 160 180)
  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = nums[i], y = nums[i+1];
    if (x >= 0 && x <= 160 && y >= 0 && y <= 185) {
      const gx = Math.floor((x / 160) * (width - 1));
      const gy = Math.floor((y / 185) * (height - 1));
      if (gy >= 0 && gy < height && gx >= 0 && gx < width) {
        grid[gy][gx] = '#';
      }
    }
  }
  
  console.log(`\n=================== ${filename} ===================`);
  console.log(grid.map(row => row.join('')).join('\n'));
}

renderAscii('Artboard 5.svg');
renderAscii('Artboard 7.svg');
