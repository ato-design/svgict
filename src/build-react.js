'use strict';

const path = require('path');
const fs = require('fs');
const { format } = require('prettier');
const upperCamelCase = require('uppercamelcase');

async function buildReact(outDir, config = {}) {
  const icons = require(path.join(outDir, './icons.json'));
  const { svgAttrs } = config;

  console.log(`Building React Components to ${outDir}...`);

  const iconsKeys = Object.keys(icons);

  const initialTypeDefinitions = `/// <reference types="react" />
import { FC, SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGElement> {
  color?: string;
  size?: string | number;
}

export type Icon = FC<IconProps>;
`;

  fs.writeFileSync(path.join(outDir, 'index.js'), '', 'utf-8');
  fs.writeFileSync(path.join(outDir, 'index.d.ts'), initialTypeDefinitions, 'utf-8');

  const attrsToString = attrs => {
    return Object.keys(attrs)
      .map(key => {
        if (key === 'width' || key === 'height' || key === 'fill') {
          return key + '={' + attrs[key] + '}';
        }
        if (key === 'rest') {
          return '{...rest}';
        }
        return key + '="' + attrs[key] + '"';
      })
      .join(' ');
  };

  iconsKeys.forEach(i => {
    const location = path.join(outDir, `${i}.js`);
    const ComponentName = upperCamelCase(i);
    const defaultAttrs = {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 'size',
      height: 'size',
      fill: 'color',
      viewBox: svgAttrs.viewBox,
      rest: '...rest',
    };

    const element = `
      // Generated by script, don't edit it please.
      import React, {forwardRef} from 'react';
      import PropTypes from 'prop-types';

      const ${ComponentName} = forwardRef(({ color = '${svgAttrs.fill}', size = ${svgAttrs.height}, ...rest }, ref) => {
        return (
          <svg ref={ref} ${attrsToString(defaultAttrs)}>
            ${icons[i]}
          </svg>
        )
      });

      ${ComponentName}.propTypes = {
        color: PropTypes.string,
        size: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number
        ]),
      }

      ${ComponentName}.displayName = '${ComponentName}'

      export default ${ComponentName}
    `;

    const component = format(element, { parser: 'babel' });

    fs.writeFileSync(location, component, 'utf-8');

    // console.log('Successfully built', ComponentName);

    const exportString = `export { default as ${ComponentName} } from './${i}';\r\n`;
    fs.appendFileSync(path.join(outDir, 'index.js'), exportString, 'utf-8');

    const exportTypeString = `export const ${ComponentName}: Icon;\n`;
    fs.appendFileSync(path.join(outDir, 'index.d.ts'), exportTypeString, 'utf-8');
  });
}

module.exports = buildReact;
