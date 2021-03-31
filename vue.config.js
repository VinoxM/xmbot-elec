module.exports = {
    runtimeCompiler: true,
    assetsDir: 'static',
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                extraResources: {
                    from: './public/resource',
                    to: './'
                },
                productName: 'xmbot-elec',
                win:{
                    icon: './public/bot.ico'
                }
            }
        }
    }
}
