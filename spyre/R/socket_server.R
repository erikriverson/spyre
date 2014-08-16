spyre_onWSOpen <- function(ws) {

    set_selected_env <- function(env) {
        assign("selected_env", env, pos = "package:spyre")
        getCurrentObjects("bootstrap", NULL, NULL, NULL, ws)
    }

    process_data <- function(binary_flag, data) {
        futile.logger::flog.debug("processing data")
        message(data)
        E <- jsonlite::fromJSON(data)
        futile.logger::flog.debug(paste("calling function:", E$fun))
        futile.logger::flog.debug(paste("The data argument is :", E$args))

        ## Call the processing function in tryCatch
        R <- tryCatch(do.call(E$fun, E$args), error = function(e) e)
        send_data(R)
    }
        
    send_data <- function(msg) {
        ## don't throw error when we don't construct a valid return
        ## value. A definition and check for 'valid return value' is
        ## needed.
        if(is.character(msg))                
            ws$send(msg)
    }

    eval_string <- function(string) {
        ## save the value to return
        ret <- tryCatch(eval(parse(text = string), env = .GlobalEnv), error =
                        function(e) as.character(e))
        ## in case objects get created
        getCurrentObjects("bootstrap", NULL, NULL, NULL, ws)
        ret
    }

    ws$onMessage(process_data)
    ws$onClose(cleanup)

    addTaskCallback(getCurrentObjects)
    futile.logger::flog.debug("added task callback")
    ## initial list
    getCurrentObjects("bootstrap", NULL, NULL, NULL, ws)

    assign("spyre", ws,  pos = "package:spyre")
}
