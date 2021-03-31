const path = require('path')
const fs = require('fs')

export const Cookies = {}
let cookies = {}

const staticPath = process.env.NODE_ENV === 'production' ? process.resourcesPath : path.join(__static, 'resource')

const source = path.join(staticPath, 'data')
fs.mkdirSync(source, {recursive: true})

const cookiesJson = path.join(source, 'cookies.json')
try{
    fs.accessSync(cookiesJson, fs.constants.F_OK)
    cookies = JSON.parse(fs.readFileSync(cookiesJson).toString())
} catch (e) {
    console.log(e)
    fs.writeFileSync(cookiesJson, JSON.stringify({}, null, 4))
}

Cookies.set = (key, value) => {
    console.log(`[setCookies] ${key}:${value}`)
    cookies[key] = value
    // console.log(cookies)
}

Cookies.get = (key) => {
    console.log(`[getCookies] ${key}:${cookies[key]}`)
    return cookies[key]
}

Cookies.saveAll = () => {
    // debugger
    console.log(`[saveCookies]`, cookies)
    fs.writeFileSync(cookiesJson, JSON.stringify(cookies, null, 4))
}
