// import { createPinia } from 'pinia';

// /**
//  * Plugin to ensure Pinia is properly initialized
//  * This runs before other plugins to prevent "no active Pinia" errors
//  */
// export default defineNuxtPlugin({
//   name: 'pinia-setup',
//   enforce: 'pre', // This ensures it runs before other plugins
//   setup(nuxtApp) {
//     const pinia = createPinia();
//     nuxtApp.vueApp.use(pinia);
//   }
// }); 