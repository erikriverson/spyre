spyre_onWSOpen <- function(ws) {

    ## does ws have to be captured by lexical scoping in the following function?
    getCurrentObjects <- function(a, b, c, d) {

        if(length(a) == 0 ||
           grepl("tryCatch|objects\\(pos", as.character(a))) {
            cat("\n regex match!! \n", file = "/home/erik/spyre.log",
                append = TRUE)
            return(TRUE)
            cat("\n cannot get here! \n", file = "/home/erik/spyre.log",
                append = TRUE)
        }

        cat("\n", as.character(a), "\n", file = "/home/erik/spyre.log",
            append = TRUE)

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

    set_selected_env <- function(D) {
        assign("selected_env", D, envir = .GlobalEnv)
        getCurrentObjects("bootstrap", NULL, NULL, NULL)
    }

    process_data <- function(binary_flag, data) {
        message("processing data")
        str(data)
        E <- jsonlite::fromJSON(data)$event
        D <- jsonlite::fromJSON(data)$data
        
        message(paste("calling function:", E))
        message(paste("The data argument is :", D))

        ## This is where we call the processing function (e.g., uv, mv, ...)
        R <- do.call(E, list(D))
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
        getCurrentObjects("bootstrap", NULL, NULL, NULL)
        ret
    }

    import <- function(D) {
        D <- substr(D, 22, nchar(D))
        assign("aaa_csv_import",
               read.table(text = base64Decode(D), header = TRUE, sep = ","), pos = .GlobalEnv)
        getCurrentObjects("bootstrap", NULL, NULL, NULL)
    }

    import_quandl <- function(D) {
        assign("quandl_test_import", Quandl(D), pos = .GlobalEnv)
        getCurrentObjects("bootstrap", NULL, NULL, NULL)
    }

    ws$onMessage(process_data)
    ws$onClose(cleanup)

    addTaskCallback(getCurrentObjects)
    message("added task callback")
    ## initial list
    getCurrentObjects("bootstrap", NULL, NULL, NULL)

    assign("ws", ws,  pos = 1)
}
