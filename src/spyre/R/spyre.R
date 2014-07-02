################################################################################
#   Program Name:     spyre.R
#   Author:           Erik Iverson <erik@sigmafield.org>
################################################################################

require(httpuv)
require(jsonlite)
require(RCurl)
require(ggvis)
require(Quandl)
require(ggplot2)
require(httr)

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
    message("removed the task callback function!")
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
