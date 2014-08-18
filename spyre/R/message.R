
## types are success, info, warning, danger.

spyre_message <- function(..., type = "info", title = "General") {
    jsonlite::toJSON(list(event = "message",
                          data = list(
                              title = unbox(title), 
                              message = unbox(paste(..., collapse = " ")),
                              type = unbox(type))))
}

spyre_message_all <- function(...) {
    ws_list <- get("spyre_clients", pos = "package:spyre")
    lapply(ws_list, function(x) x$send(spyre_message(...)))
}
