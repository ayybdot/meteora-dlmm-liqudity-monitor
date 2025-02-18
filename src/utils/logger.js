export class Logger {

    constructor(name){
        this.name = name
        this.start = new Date().getTime()
        this.count = 0
        if(process.env.LOG_REPORTS){
            setInterval(() => {
                this.log()
            }, 10000)
        }
    }

    log(){
        const now = new Date().getTime()
        const avg = this.count / ((now - this.start) / 1000)
        console.log(`${this.name} - Fetch per second: ${avg}`)
    }

}