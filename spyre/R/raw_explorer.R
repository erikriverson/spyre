get_rawdata <- function(data) {
    D1 <- get(data[[1]][[1]])
    jsonlite::toJSON(list(event = "rawdata", data = list(value = D1)))
}
