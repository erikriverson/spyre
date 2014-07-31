#' @export
getCurrentObjects <- function(a, b, c, d, ws) {

        env <- get_selected_env()
        
        objects <- objects(env)
        objects_list <- lapply(objects, generate_object_list)

        ## what is this doing?
        ## objects_list <- lapply(seq_along(objects_list),
        ##                        function (i) sapply(objects_list, "[", i))

        ret_list <- list(event = "objects", data = objects_list)
        ws$send(jsonlite::toJSON(ret_list))

        env_list <- list(event = "environments", data = search())
        ws$send(jsonlite::toJSON(env_list))

        action_list <- list(event = "actions", data = actions())
        ws$send(jsonlite::toJSON(action_list))

        TRUE
    }


spyre_onWSOpen <- function(ws) {


    set_selected_env <- function(D) {
        assign("selected_env", D, envir = .GlobalEnv)
        getCurrentObjects("bootstrap", NULL, NULL, NULL, ws)
    }

    process_data <- function(binary_flag, data) {
        futile.logger::flog.debug("processing data")
        E <- jsonlite::fromJSON(data)$event
        D <- jsonlite::fromJSON(data)$data
        
        futile.logger::flog.debug(paste("calling function:", E))
        futile.logger::flog.debug(paste("The data argument is :", D))

        ## Call the processing function in tryCatch
        R <- tryCatch(do.call(E, list(D)), error = function(e) e)
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
