let ws;
let timeInterval;
let recon_count = 0;

const defaultPrefix = 'dev'

const devServer = process.env["VUE_APP_DEV_SERVER "]||'127.0.0.1'
const proServer = process.env["VUE_APP_PRO_SERVER "]||'127.0.0.1'
const socketPort = process.env["VUE_APP_SOCKET_PORT"]||9220

const urlConf = {
    base: `ws://${proServer}:${socketPort}/`,
    dev: `ws://${devServer}:${socketPort}/`,
    pro: `ws://${proServer}:${socketPort}/`
}

export const socket = {
    send: (msg) => ws.send(msg),
    close: () => ws.close(),
    ready: false,
    isConnecting: false,
    connect: (vue) => createWs(vue)
}


export function createWs(vue) {
    console.log(`${recon_count === 0 ? 'ws connecting' : `ws reconnection [${recon_count} times]`}`)
    if (ws) ws.close()
    socket.isConnecting = true
    let curPrefix = vue.$cookies.get('curUrlPrefix')
    const url = urlConf[curPrefix ? curPrefix : defaultPrefix]
    ws = new WebSocket(url)
    init(vue)
}

function init(vue) {
    ws.onopen = () => {
        socket.isConnecting = false
        socket.ready = true
        recon_count = 0
        console.log('ws connected')
    }

    ws.onerror = () => {
        socket.isConnecting = false
        socket.ready = false
        console.log(`ws connect error${recon_count < 3 ? ',reconnect in 2s later' : ',refresh page to reconnect'}`)
        // reconnect(vue)
    }

    ws.onclose = () => {
        console.log('ws closed')
        socket.isConnecting = false
        socket.ready = false
        // recon_count = 0
        reconnect(vue)
    }

    ws.onmessage = (event) => {
        let data = JSON.parse(event.data)
        console.log(`Socket get [${data.type}] message`, data.data)
        switch (data.type) {
            case 'all':
                vue.$store.commit('flushChatLog', data.data)
                break
            case 'elem':
                vue.$store.commit('pushChatLog', data.data)
                break
            case 'more':
                vue.$store.commit('appendChatLog', data.data)
                break
            case 'status':
                vue.$store.commit('updateBotReady', data.data)
                break
        }
    }
}

function reconnect(vue) {
    recon_count++
    if (socket.isConnecting || socket.ready || recon_count > 3) return
    timeInterval && clearTimeout(timeInterval)
    timeInterval = setTimeout(() => {
        createWs(vue)
    }, 2000)
}
