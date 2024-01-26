
export function log(msg: string) {
    console.debug(msg);
}

export function logAll (args : string[]){
    let sep = " ";
    let msg = "";
    for (let i = 0; i < args.length; i++) {
        msg = msg + sep + args[i];
    }
    log(msg);
} 

export function logParams (funcName: string, paramNames: string[] = [], vals: any[] = []) {
    let args : any[] = [];
    args.push(funcName + "():");

    if (paramNames.length !== vals.length) {
        console.error("Mismatched args size");
    }

    for (let i = 0; i < paramNames.length; i++) {
        args.push(paramNames[i]);
        args.push("-");
        args.push(vals[i]);
        args.push("|");
    }

    logAll(args);

}
