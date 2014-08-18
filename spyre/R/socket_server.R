spyre_clients <- list()

spyre_onWSOpen <- function(ws) {
    set_selected_env <- function(env) {
        assign("selected_env", env, pos = "package:spyre")
        getCurrentObjects("bootstrap", NULL, NULL, NULL,
                          get("spyre_clients",
                              pos = "package:spyre"))
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

    ws$onMessage(process_data)
    ws$onClose(cleanup)
    ws$send(spyre_message("Connected to Spyre Server", type = "success"))

    ## only if it's not already there, right?
    ## I.e., not on the second client connection?
    addTaskCallback(getCurrentObjects)
    
    futile.logger::flog.debug("added task callback")
    ## initial list

    spyre_message_all("New client joined!", type = "success")

    assign("spyre_clients", c(get("spyre_clients", pos = "package:spyre"), ws),
           pos = "package:spyre")



    getCurrentObjects("bootstrap", NULL, NULL, NULL,
                      get("spyre_clients", pos = "package:spyre"))


}
