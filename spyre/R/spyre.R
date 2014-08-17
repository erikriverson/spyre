################################################################################
#   Program Name:     spyre.R
#   Author:           Erik Iverson <erik@sigmafield.org>
################################################################################

fortune_cookie <- function(...) {
    spyre_message(data = paste0(capture.output(fortunes::fortune(...)),
                      collapse = "\n"), title = "Fortune Cookie")
}
    

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

spyre_servers <- data.frame(handle = character(0),
                            name   = character(0),
                            port   = integer(0),
                            stringsAsFactors = FALSE)

#' @export
spyre_start <- function(port = 7681, name = "SpyreServer") {
    servers <- get("spyre_servers", pos = "package:spyre")

    if(name %in% servers$name) {
        stop(paste("Spyre Server already running with that name:", name))
    }

    if(port %in% servers$port) {
        stop(paste("Spyre Server already running on that port:", port))
    }

    app <- list(call = spyre_call, onWSOpen = spyre_onWSOpen)
    handle <- httpuv::startDaemonizedServer("127.0.0.1", port, app = app)

    assign("spyre_servers", rbind(spyre_servers,
                                  data.frame(handle = handle, name = name,
                                             port = port,
                                             stringsAsFactors = FALSE)),
           pos = "package:spyre")

    packageStartupMessage(paste0("Spyre Server (", name,
                                 ") now running on port ", port))

}

#' @export
spyre_stop <- function(name) {
    servers <- get("spyre_servers", pos = "package:spyre")
    if(!missing(name)) {
        httpuv::stopDaemonizedServer(servers[servers$name == name,
                                             "handle"])
    }
    message(paste0("Spyre Server (", name, ") stopped."))
}

spyre_list <- function() {
    get("spyre_servers", pos = "package:spyre")
}

#' @export
spyre_stop_all <- function() {
    servers <- get("spyre_servers", pos = "package:spyre")
    if(nrow(servers)) {
        lapply(servers$name, spyre_stop)
    }
}

.onAttach <- function(x, y) {
    spyre_start()
}

.onDetach <- function(x) {
    spyre_stop_all()
}
