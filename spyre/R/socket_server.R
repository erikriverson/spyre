

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

    ## callback functions
    ws$onMessage(process_data)
    ws$onClose(client_disconnect_cleanup)

    ## messaging to new/current clients about event

    ## before we add the new client to the list
    spyre_message_all("New client joined:", ws$request$REMOTE_ADDR, type = "success")

    lcl <- get("spyre_clients", pos = "package:spyre")
    ws$send(spyre_message("Connected to Spyre Server. There are", length(lcl),
                          "other clients connected.", type = "success"))

    ## only if it's not already there, right?
    ## I.e., not on the second client connection?
    addTaskCallback(getCurrentObjects)
    
    futile.logger::flog.debug("added task callback")
    ## initial list

    ## add the new client to the list
    
    assign("spyre_clients", c(lcl, ws), pos = "package:spyre")

    getCurrentObjects("bootstrap", NULL, NULL, NULL,
                      get("spyre_clients", pos = "package:spyre"))

}
