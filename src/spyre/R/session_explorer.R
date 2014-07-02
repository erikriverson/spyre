session <- function(x) {
    session <- paste0(capture.output(sessionInfo()), collapse = "\n")
    message(session)
    list(event = "session", data = list(summary = session))
}
