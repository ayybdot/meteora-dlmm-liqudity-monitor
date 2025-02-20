import { LOG_INTERVAL} from "../config/constants.js"

const loggers = []

export class Logger {

    constructor(name){
        this.name = name
        this.start = Date.now()
        this.count = 0
        this.errors = 0
        this.lastSycleCount = 0
        loggers.push(this)
    }

    countRequest(){
        this.count++
        this.lastSycleCount++
    }

    logError(error) {
        this.errors++
        console.error(`[${this.name}] Error:`, error)
    }

    log(){

        let AverageRquests = this.count / ((Date.now() - this.start) / 1000)
        let TotalRequest = this.count
        let TotalErrors = this.errors
        let LastSycleRequests = this.lastSycleCount
        this.lastSycleCount = 0

        return {
            Name: this.name,
            [`Average Requests req/s`] : +AverageRquests.toFixed(2),
            [`Total Requests`] : TotalRequest,
            [`Total Errors`] : TotalErrors,
            [`Last Sycle Requests`] : LastSycleRequests
        }

    }

}

if(process.env.LOG_REPORTS){
    setInterval(() => {
        
        const dataTable = loggers.map(logger => logger.log())
        console.table(dataTable)

    }, LOG_INTERVAL);
}