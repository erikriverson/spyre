################################################################################
#   Program Name:     spyre/server.R
#   Author:           Erik Iverson
#   Created:          2013-11-18
#   Purpose:          Testbed for websocket functionality
################################################################################

require(httpuv)
require(jsonlite)

getCurrentObjects <- function(a, b, c, d) {
  my_objects <- objects(".GlobalEnv")
  expel <- c("getCurrentObjects", "setupTestServer", "spyre", "spyre.data.frame",
             "spyre.default", "spyre.factor", "spyre.function", "static_file_service2", "w")
  objects <- setdiff(my_objects, expel)
  ret_list <- list(event = "objects", data = objects)
  websocket_broadcast(jsonlite::toJSON(ret_list), w)
  TRUE
}

spyre_call <- function(req) {
    message("spyre_call")
}

spyre_onWSOpen <- function(ws) {
    message("spyre_onWSOpen")
    str(ws)
    ws$onMessage(function(x) message(x))
}

app <- list(call = spyre_call,
            onWSOpen = spyre_onWSOpen)

if(exists("handle")) {
    stopDaemonizedServer(handle)
}
handle <- startDaemonizedServer("127.0.0.1", 7681, app = app)

removeTaskCallback(1)
addTaskCallback(getCurrentObjects)
