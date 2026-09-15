import {themes as prismThemes} from 'prism-react-renderer';
import { createConfig } from './.shared-config/index.js';
import { providerName, providerTitle } from './provider.js';

const config = createConfig({
  providerName,
  providerTitle,
  prismThemes,
  overrides: {
    future: {
      v4: true,
      faster: true,
    },
  },
});

// This provider's website lives at website/googleworkspace/ within the canonical
// stackql/stackql-provider-google repo (one repo hosts the google family of
// microsites), so projectName and the "Edit this page" links point there
// rather than at the shared-config defaults.
config.projectName = 'stackql-provider-google';
config.presets[0][1].docs.editUrl =
  'https://github.com/stackql/stackql-provider-google/edit/main/website/googleworkspace/';

// Social/share card for this site.
config.themeConfig.image = '/img/stackql-google-provider-featured-image.png';

// Use the locally vendored registry-branded logos (STACKQL>> | REGISTRY) instead
// of the shared config's hotlinked main-site wordmark - self-contained assets, no
// cross-origin fetch. global.css swaps in the -mobile variants below 996px.
const registryLogo = {
  alt: 'StackQL',
  href: '/',
  src: 'img/stackql-registry-logo.svg',
  srcDark: 'img/stackql-registry-logo-white.svg',
};
config.themeConfig.navbar.logo = { ...registryLogo };
config.themeConfig.footer.logo = { ...registryLogo };

// Date-stamp every doc page ("Last updated on ..."), matching the aws
// microsite. The shared config ships showLastUpdateTime: false, and
// .shared-config is wiped and re-cloned on every build (vendor-config), so
// the flip must live here post-createConfig. Timestamps come from git
// history; the docs tree is committed after every regen, so pages stamp
// with their last regeneration date.
config.presets[0][1].docs.showLastUpdateTime = true;

// URL form. Keep the Docusaurus default (pages emitted as <route>/index.html)
// regardless of the shared config's trailingSlash setting, so GitHub Pages
// serves both /services/x/y and /services/x/y/. A trailingSlash: false site
// emits <route>.html instead, which returns 404 for the trailing-slash URL.
delete config.trailingSlash;

export default config;
