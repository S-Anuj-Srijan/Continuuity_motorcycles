import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'tests/browser',fullyParallel:false,workers:1,timeout:30000,
 use:{baseURL:'http://localhost:8787',trace:'retain-on-failure'},
 projects:[{name:'desktop-chromium',use:{...devices['Desktop Chrome']}},{name:'mobile-chromium',use:{...devices['Pixel 7']}}],
 webServer:{command:'npm run preview -- --port 8787',url:'http://localhost:8787',reuseExistingServer:true,timeout:120000},
 reporter:'list'
});
