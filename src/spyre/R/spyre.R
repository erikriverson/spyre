################################################################################
#   Program Name:     spyre.R
#   Author:           Erik Iverson <erik@sigmafield.org>
################################################################################

get_selected_env <- function() {
    if(exists("selected_env", .GlobalEnv)) {
        selected_env
    } else {
        ".GlobalEnv"
    }
}

actions <- function() {
    list(rm = "rm", dput = "dput")
}

eval_string <- function(D) {
    data <- capture.output(eval_string(D[[1]]))
    jsonlite::toJSON(list(data = list(summary = data)))
}

rawdata <- function(D) {
    D1 <- get(D[[1]][[1]])
    str(D1)
    jsonlite::toJSON(list(event = "rawdata", data = list(value = D1)))
}

`%i%` <- function(object, index_list) {
    if(length(index_list) == 0)
        return(object)
    object <- do.call("[[", list(object, index_list[[1]]))
    object %i% index_list[-1]
}


iget <- function(object_desc) {
    message("passed to iget")
    message(str(object_desc))
    if(length(object_desc) > 1) {
        obj <- object_desc[[1]] %i% object_desc[2:length(object_desc)]
    } else {
        obj <- get(object_desc)
    }
    obj
}

spyre_call <- function(req) {
    message("spyre_call")
}

CLOSE <- function(D) {
    cleanup()
}

cleanup <- function() {
    removeTaskCallback(1)
    message("removed the task callback function!")
}

#' @export
start_spyre <- function(port = 7681) {
    app <- list(call = spyre_call, onWSOpen = spyre_onWSOpen)
    packageStartupMessage(paste("spyre running on port ", port))
    startDaemonizedServer("127.0.0.1", port, app = app)
}

#' @export
stop_spyre <- function(handle) {
    stopDaemonizedServer(handle)
}

.onAttach <- function(x, y) {
    handle <- start_spyre()
    assign("spyre_handle", handle, pos = "package:spyre")
}

.onDetach <- function(x) {
    stop_spyre(get("spyre_handle", pos = "package:spyre"))
}
