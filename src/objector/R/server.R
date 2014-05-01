################################################################################
#   Program Name:     spyre/server.R
#   Author:           Erik Iverson
#   Created:          2013-11-18
#   Purpose:          Testbed for websocket functionality
################################################################################

require(websockets)
require(jsonlite)

setupTestServer <- function(file = "../../client/index.html") {
  w <- create_server(webpage = static_file_service2(file))
  w$DEBUG <- TRUE

  f <- function(DATA, WS, ...) {
      D <- jsonlite::fromJSON(rawToChar(DATA))$data
      websocket_write(DATA = jsonlite::toJSON(spyre(get(D))), WS = WS)
  }
  
  set_callback('receive',f,w)
  
  cl <- function(WS) {
    message("Websocket client socket ",WS$socket," has closed.\n")
  }

  set_callback('closed',cl,w)
  
  es <- function(WS) {
    message("Websocket client socket ",WS$socket," has been established.\n")
    getCurrentObjects()
  }
  
  set_callback('established',es,w)
  return(w)
}

static_file_service2 <- function(fn)
{
  file_name <- fn
  f <- file(fn)
  file_content <- paste(readLines(f),collapse="\n")
  originalTime <- file.info(fn)$mtime
  
  close(f)
  
  function(socket, header) {
    finf <- file.info(fn)
    if(difftime(finf[,"mtime"], originalTime, units="secs") > 0){
      f <- file(fn)
      file_content <<- paste(readLines(f),collapse="\n")
      close(f)
    }
    if(is.null(header$RESOURCE))
      return(websockets:::.http_400(socket))
    if(header$RESOURCE == "/favicon.ico") {
      websockets:::.http_200(socket,"image/x-icon", .html5ico)
    }
    else {
      websockets:::.http_200(socket, content = file_content)
    }
  }
}

getCurrentObjects <- function(a, b, c, d) {
  my_objects <- objects(".GlobalEnv")
  expel <- c("getCurrentObjects", "setupTestServer", "spyre", "spyre.data.frame",
             "spyre.default", "spyre.factor", "spyre.function", "static_file_service2", "w")
  objects <- setdiff(my_objects, expel)
  ret_list <- list(event = "objects", data = objects)
  websocket_broadcast(jsonlite::toJSON(ret_list), w)
  TRUE
}


if(exists("w"))
    websocket_close(w)
w <- setupTestServer()
daemonize(w)
removeTaskCallback(1)
addTaskCallback(getCurrentObjects)
