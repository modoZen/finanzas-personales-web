import type { Configuration } from 'lint-staged';

const lintStagedConfig: Configuration = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,css,html,md}': 'prettier --write',
};

export default lintStagedConfig;
