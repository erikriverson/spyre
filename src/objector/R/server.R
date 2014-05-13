################################################################################
#   Program Name:     server.R
#   Author:           Erik Iverson <erik@sigmafield.org>
#   Purpose:          httpuv implementation of spyre server
################################################################################

require(httpuv)
require(jsonlite)
library(ggvis)

uv <- function(D) {
    if(length(D) > 1)
        D <- iget(D[[1]], D[2:length(D)])
    else
        D <- get(D[[1]])
    jsonlite::toJSON(spyre(D))
}

mv <- function(D) {
    if(length(D[[1]]) > 1)
        D1 <- iget(D[[1]][[1]], D[[1]][2:length(D[[1]])])
    else
        D1 <- get(D[[1]][[1]])
    if(length(D[[2]]) > 1)
        D2 <- iget(D[[2]][[1]], D[[2]][2:length(D[[2]])])
    else
        D2 <- get(D[[2]][[1]])
    jsonlite::toJSON(multivariate(D1, D2))
}

eval_string <- function(D) {
    data <- capture.output(eval_string(D[[1]]))
    jsonlite::toJSON(list(event = event,
                          data = list(summary = data)))
}

generate_tree_data <- function(object, index = 1, parent, object_names) {

    if(missing(parent)) {
        obj_name <- object
        object <- get(object)
        
        parent <- list(label = unbox(obj_name),
                       data = list(root_object = obj_name,
                           object_index = list(obj_name)))
        
    } else {
        parent <- list(label = unbox(object_names[index]),
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
                       SIMPLIFY = FALSE, USE.NAMES = FALSE)

    c(parent, children = list(children))
}

`%i%` <- function(object, index_list) {
    if(length(index_list) == 0)
        return(object)
    object <- do.call("[[", list(object, index_list[[1]]))
    object %i% index_list[-1]
}

iget <- function(object_name, index_list) {
    obj <- get(object_name)
    obj %i% index_list
}


spyre_call <- function(req) {
    message("spyre_call")
}

CLOSE <- function(D) {
    cleanup()
}

cleanup <- function() {
    removeTaskCallback(1)
}

spyre_onWSOpen <- function(ws) {

    getCurrentObjects <- function(a, b, c, d) {
        message("getCurrentObjects run, sending list of objects")
        objects <- objects(".GlobalEnv")

        objects_list <- list(tree_data = lapply(objects, generate_tree_data),
                             object_class = lapply(objects, function(x) class(get(x))))

        objects_list <- lapply(seq_along(objects_list[[1]]),
                               function (i) sapply(objects_list, "[", i))

        ret_list <- list(event = "objects", data = objects_list)
        ws$send(jsonlite::toJSON(ret_list))
        TRUE
    }


    process_data <- function(binary_flag, data) {
        E <- jsonlite::fromJSON(data)$event
        D <- jsonlite::fromJSON(data)$data
        message(E)
        message(str(D))

        R <- do.call(E, list(D))
        send_data(R)
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

    ws$onMessage(process_data)
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
