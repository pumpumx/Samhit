


export const appPortMethod = () => {
    const port: (string | undefined) = process.env.APP_PORT
    if (!port) throw new Error("No port available")
    const appPort = JSON.parse(port)
    return appPort.number
}