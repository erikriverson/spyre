
## types are success, info, warning, danger.

spyre_message <- function(..., type = "info") {
    jsonlite::toJSON(list(event = "message",
                          data = list(message = paste(...), type = type)))
}
