spyre_call <- function(req) {

    if(req$PATH_INFO != "/") {
        fp <- paste(c("dist", unlist(strsplit(req$PATH_INFO, "/"))[-1]),
                    collapse = "/")
        file_req <- system.file(fp, package = "spyre")

        body <- paste(readLines(file_req), collapse = "\n")
        fe <- tools::file_ext(file_req)
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
    client_disconnect_cleanup()
}

client_disconnect_cleanup <- function() {

    ## how do we move this ws object from the spyre_clients list?
    ## we'll probably have to associate a name with each spyre connection
    ## we have the handle already though
    
    if(length(get("spyre_clients", pos = "package:spyre")) == 1) {
        removeTaskCallback(1)
    }

    ## this bad syntax caused an Rcpp::eval_error and R crash
    ## if(length(get("spyre_clients", pos = "package:spyre") == 1)) {
    ##     removeTaskCallback(1)
    ## }

    lcl <- get("spyre_clients", pos = "package:spyre")
    close_client <-
        which(unlist(lapply(lcl, function(x) is.null(x[[".handle"]]))))

    lcl[[close_client]] <- NULL
    assign("spyre_clients", lcl, pos = "package:spyre")

    futile.logger::flog.debug("removed task callback function")
}

spyre_clients <- list()

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
    handle <- httpuv::startDaemonizedServer("0.0.0.0", port, app = app)

    assign("spyre_servers", rbind(spyre_servers,
                                  data.frame(handle = handle, name = name,
                                             port = port,
                                             stringsAsFactors = FALSE)),
           pos = "package:spyre")

    packageStartupMessage(paste0("Spyre Server (", name,
                                 ") now running on port ", port))

}

#' @export

spyre_list <- function() {
    get("spyre_servers", pos = "package:spyre")
}

#' @export
spyre_stop <- function(name) {
    spyre_message_all("Server is shutting down now!", type = "danger")
    
    servers <- get("spyre_servers", pos = "package:spyre")

    if(missing(name)) {
        stop("Provide name of Spyre server to shutdown.
              See list with spyre_list()")
    }
        
    shutdown <- servers[servers$name == name, "handle"]
    if(!length(shutdown)) {
        stop("No Spyre server running by that name")
    }

    httpuv::stopDaemonizedServer(shutdown)
    message(paste0("Spyre Server (", name, ") stopped."))

    assign("spyre_servers", spyre_servers[!spyre_servers$name == name, ],
           pos = "package:spyre")
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
    message("All Spyre servers shutdown.")
}

.onAttach <- function(x, y) {
    spyre_start()
}

.onDetach <- function(x) {
    spyre_stop_all()
}
