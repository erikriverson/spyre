session <- function(x) {
    session <- paste0(capture.output(sessionInfo()), collapse = "\n")
    futile.logger::flog.debug(session)
    list(event = "session", data = list(summary = session))
}
