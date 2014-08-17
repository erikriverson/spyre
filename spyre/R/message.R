
## types are success, info, warning, danger.

spyre_message <- function(..., type = "info", title = "General") {
    jsonlite::toJSON(list(event = "message",
                          data = list(
                              title = unbox(title), 
                              message = unbox(paste(..., collapse = " ")),
                              type = unbox(type))))
}
