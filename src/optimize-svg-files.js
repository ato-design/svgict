'use strict';

const fs = require('fs');
const path = require('path');
const optimizeSvg = require('./optimize-svg');

async function optimizeSvgFiles(inDir, config) {
  // const inDir = path.resolve(__dirname, '../icons');
  console.log(`Optimizing svgs in ${inDir}...`);
  await Promise.all(
    fs
      .readdirSync(inDir)
      .filter(file => path.extname(file) === '.svg')
      .map(svgFile => {
        const svg = fs.readFileSync(path.join(inDir, svgFile), 'utf8');
        return optimizeSvg(svg, config).then(svg => fs.writeFileSync(path.join(inDir, svgFile), svg));
      }),
  );
}

module.exports = optimizeSvgFiles;
