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

    generate_tree_data <- function(object, index = 1, parent, object_names) {

        if(missing(parent)) {
            obj_name <- object
            object <- get(object)
            
            parent <- list(label = obj_name,
                           data = list(root_object = obj_name,
                               object_index = list(obj_name)))
            
        } else {
            parent <- list(label = object_names[index],
                           data= list(root_object = parent$data$root_object,
                               object_index = c(parent$data$object_index,
                                   object_names[[index]])))
        }

        if(!is.list(object)) {
            return(parent)
        }


        named <- if(is.null(names(object))) {
            rep(FALSE, length(object))
        } else {
            ifelse(names(object) == "", FALSE, TRUE)
        }
        
        children <- mapply(generate_tree_data,
                           object = object,
                           index = seq_along(object),
                           MoreArgs = list(parent = parent,
                               object_names = ifelse(named, names(object),
                                   seq_along(object))),
                           SIMPLIFY = FALSE)

        c(parent, children = list(children))
    }


    getCurrentObjects <- function(a, b, c, d) {
        objects <- objects(".GlobalEnv")

        objects_list <- lapply(objects, generate_tree_data)
        ret_list <- list(event = "objects", data = objects_list)
        ws$send(jsonlite::toJSON(ret_list))
        if(FALSE) {
            message(prettify(jsonlite::toJSON(ret_list)))
        }
        TRUE
    }

    receive_data <- function(binary_flag, data) {
        E <- jsonlite::fromJSON(data)$event
        D <- jsonlite::fromJSON(data)$data
        
        ## hack until .close is figured out from client
        if(D == ".CLOSING.") {
            cleanup()
        } else if(E == "request_objects") {
            send_data(jsonlite::toJSON(spyre(get(D))))
        } else {
            event <- "object"           #NB: temporary, needs own type
            data <- capture.output(eval_string(D))
            send_data(jsonlite::toJSON(list(event = event,
                                            data = list(summary = data))))
        }
    }
        
    send_data <- function(msg) {
        ws$send(msg)
    }

    eval_string <- function(string) {
        ## save the value to return
        ret <- tryCatch(eval(parse(text = string), env = .GlobalEnv), error =
                        function(e) as.character(e))
        ## in case objects get created
        getCurrentObjects(NULL, NULL, NULL, NULL)
        ret
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


## bootstrap
if(exists("handle"))
    stop_spyre(handle)
handle <- start_spyre()
