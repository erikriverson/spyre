################################################################################
#   Program Name:     spyre.R
#   Author:           Erik Iverson <erik@sigmafield.org>
################################################################################

get_selected_env <- function() {
    if(exists("selected_env", "package:spyre")) {
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


`%i%` <- function(object, index_list) {
    if(length(index_list) == 0)
        return(object)
    object <- do.call("[[", list(object, index_list[[1]]))
    object %i% index_list[-1]
}

iget <- function(object_desc) {
    futile.logger::flog.debug(capture.output(str(object_desc)))
    if(grepl('^#', object_desc[[1]]) || is.numeric(object_desc[[1]])) {
       return(object_desc)
   }

    obj <- get(object_desc[[1]])
               
    if(length(object_desc) > 1) {
        obj <- obj %i% object_desc[2:length(object_desc)]
    }

    obj
}

spyre_call <- function(req) {

    if(req$PATH_INFO != "/") {
        fp <- paste(c("dist", unlist(strsplit(req$PATH_INFO, "/"))[-1]),
                    collapse = "/")
        file_req <- system.file(fp, package = "spyre")

        body <- paste(readLines(file_req), collapse = "\n")
        fe <- file_ext(file_req)
        mime <- if(fe == "css") "text/css" else "application/javascript"
        headers <- list('Content-Type' = mime)
    } else {
        body <- paste(readLines(system.file("dist", "index.html",
                                            package = "spyre")),
                      collapse = "\n")
        headers <- list('Content-Type' = 'text/html')
    }
    list(
        status = 200L,
        headers = headers,
        body = body)


}

CLOSE <- function(D) {
    cleanup()
}

cleanup <- function() {
    removeTaskCallback(1)
    futile.logger::flog.debug("removed task callback function")
}

#' @export
start_spyre <- function(port = 7681) {
    app <- list(call = spyre_call, onWSOpen = spyre_onWSOpen)
    packageStartupMessage(paste("spyre running on port", port))
    httpuv::startDaemonizedServer("127.0.0.1", port, app = app)
}

#' @export
stop_spyre <- function(handle) {
    if(missing(handle)) {
        handle <- get("spyre_handle", pos = "package:spyre")
    }
    
    httpuv::stopDaemonizedServer(handle)
}

.onAttach <- function(x, y) {
    handle <- start_spyre()
    assign("spyre_handle", handle, pos = "package:spyre")
}

.onDetach <- function(x) {
    stop_spyre(get("spyre_handle", pos = "package:spyre"))
}
