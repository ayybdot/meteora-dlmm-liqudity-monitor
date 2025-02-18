export class Logger {

    constructor(name){
        this.name = name
        this.start = Date.now()
        this.count = 0
        this.errors = 0
        this.lastError = null
        
        if(process.env.LOG_REPORTS === 'true'){
            this.startReporting()
        }
    }

    startReporting() {
        setInterval(() => this.log(), 10000)
    }

    logError(error) {
        this.errors++
        this.lastError = error
        console.error(`[${this.name}] Error:`, error)
    }

    log(){
        const now = Date.now()
        const runtime = (now - this.start) / 1000
        const avg = this.count / runtime
        
        console.log(`
            Service: ${this.name}
            Requests/sec: ${avg.toFixed(2)}
            Total requests: ${this.count}
            Total errors: ${this.errors}
            Uptime: ${runtime.toFixed(0)}s
        `)
    }

}