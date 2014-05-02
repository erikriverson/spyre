################################################################################
#   Program Name:     spyre/server.R
#   Author:           Erik Iverson
#   Purpose:          httpuv implementation of spyre
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
        my_objects <- objects(".GlobalEnv")
        expel <- c("getCurrentObjects", "setupTestServer", "spyre", "spyre.data.frame",
                   "spyre.default", "spyre.factor", "spyre.function", "static_file_service2", "w")
        objects <- setdiff(my_objects, expel)
        ret_list <- list(event = "objects", data = objects)
        ws$send(jsonlite::toJSON(ret_list))
        TRUE
    }

    addTaskCallback(getCurrentObjects)

    receive_data <- function(binary_flag, data) {
        message(binary_flag)
        message(data)
        D <- jsonlite::fromJSON(data)$data
        send_data(jsonlite::toJSON(spyre(get(D))))
    }

    send_data <- function(msg) {
        ws$send(msg)
    }

##    message("spyre_onWSOpen")
    ws$onMessage(receive_data)
    ws$onClose(cleanup)
}

start_spyre <- function(app) {
    app <- list(call = spyre_call, onWSOpen = spyre_onWSOpen)
    startDaemonizedServer("127.0.0.1", 7681, app = app)
}

stop_spyre <- function(handle) {
    stopDaemonizedServer(handle)
}

if(exists("handle"))
    stop_spyre(handle)
handle <- start_spyre()



 

