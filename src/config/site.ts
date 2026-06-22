export const site = {
  name: 'OpenJarvis',
  tagline: 'Personal AI, On Personal Devices',
  subhead: 'Build personal AI that runs on your hardware. Cloud APIs are optional.',
  links: {
    github: 'https://github.com/open-jarvis/OpenJarvis',
    docs: 'https://open-jarvis.github.io/OpenJarvis/',
    discord: 'https://discord.gg/CMVBmDQ5Fj',
    paper: 'https://arxiv.org/abs/2605.17172',
    releases: 'https://github.com/open-jarvis/OpenJarvis/releases',
    ipw: 'https://www.intelligence-per-watt.ai/',
  },
  install: 'curl -fsSL open-jarvis.github.io/install.sh | bash',
  footerNote: 'Local-first by default · A Stanford research project · Apache-2.0',
} as const;
