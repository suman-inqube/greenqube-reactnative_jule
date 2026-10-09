export const config: WebdriverIO.Config = {
    runner: 'local',
    port: 4723,
    path: '/wd/hub',
    specs: [
        './e2e/specs/**/*.ts'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:app': './android/app/build/outputs/apk/debug/app-debug.apk',
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 240
    }],
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
}
