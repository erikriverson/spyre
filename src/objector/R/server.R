################################################################################
#   Program Name:     server.R
#   Author:           Erik Iverson <erik@sigmafield.org>
#   Purpose:          httpuv implementation of spyre server
################################################################################

require(httpuv)
require(jsonlite)

spyre_call <- function(req) {
    message("spyre_call")
}

spyre_onWSOpen <- function(ws) {

    cleanup <- function() {
        removeTaskCallback(1)
    }

    getCurrentObjects <- function(a, b, c, d) {
        objects <- objects(".GlobalEnv")
        objects_df <- data.frame(name = objects(".GlobalEnv"),
                                 class = sapply(objects,
                                     function(x) class(get(x))),
                                 dim = sapply(objects,
                                     function(x) {
                                         nr <- nrow(get(x))
                                         if(is.null(nr))
                                             nr <- length(get(x))
                                         nr
                                     }),
                                 size = sapply(objects,
                                     function(x) object.size(get(x))))
                                 
        ret_list <- list(event = "objects", data = objects_df)
        ws$send(jsonlite::toJSON(ret_list))
        TRUE
    }

    receive_data <- function(binary_flag, data) {
        E <- jsonlite::fromJSON(data)$event
        D <- jsonlite::fromJSON(data)$data
        message("D: ", D)
        
        ## hack until .close is figured out from client
        if(D == ".CLOSING.") {
            cleanup()
        } else if(E == "request_objects") {
            send_data(jsonlite::toJSON(spyre(get(D))))
        } else {
            event <- "default"
            data <- capture.output(eval_string(D))
            message(data)
            send_data(jsonlite::toJSON(list(event = event,
                                            data = list(summary = data))))
        }
    }
        
    send_data <- function(msg) {
        ws$send(msg)
    }

    ws$onMessage(receive_data)
    ws$onClose(cleanup)

    addTaskCallback(getCurrentObjects)
    ## initial list
    getCurrentObjects(NULL, NULL, NULL, NULL)
}

#' @export
start_spyre <- function(app) {
    app <- list(call = spyre_call, onWSOpen = spyre_onWSOpen)
    startDaemonizedServer("127.0.0.1", 7681, app = app)
}

#' @export
stop_spyre <- function(handle) {
    stopDaemonizedServer(handle)
}

eval_string <- function(string) {
    tryCatch(eval(parse(text = string)), error =
             function(e) as.character(e))
}

## bootstrap
if(exists("handle"))
    stop_spyre(handle)
handle <- start_spyre()
