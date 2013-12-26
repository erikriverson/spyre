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
      D <- ""
      if(is.raw(DATA))
          D <- rawToChar(DATA)

      websocket_write(DATA = spyre(get(D)), WS = WS)
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

spyre <- function(x, ...) {
    UseMethod("spyre")
}

spyre.default <- function(x, ...) {
    value <- paste(capture.output(str(x)), collapse = "\n")
    ## need a way to limit size of x (likely)
    ret_list = list(key = "default", summary = value, value = x)
    jsonlite::toJSON(ret_list)
}

spyre.data.frame <- function(x, ...) {
    value <- paste(capture.output(summary(x)), collapse = "\n")
    ret_list = list(key = "default", summary = value, value = x)
    jsonlite::toJSON(ret_list)
}


spyre.factor <- function(x, ...) {
    summary <- paste(c(capture.output(table(x)),
                   capture.output(levels(x))), collapse = "\n")

    value <- as.data.frame(table(x))
    names(value) <- c("x", "y")
    
    ## need a way to limit size of x (likely)
    ret_list = list(key = "default", summary = summary,
        value = value)
    
    jsonlite::toJSON(ret_list)
}

spyre.function <- function(x, ...) {
    value <- paste(capture.output(args(x)), collapse = "\n")
    ret_list = list(key = "default", summary = value)
    jsonlite::toJSON(ret_list)
}

## think what we want for summary/value, raw or summarized?
## should summarized be a single string in JSON?

getCurrentObjects <- function(a, b, c, d) {
  objects <- objects(".GlobalEnv")
  ret_list <- list(key = "objects", value = objects)
  websocket_broadcast(toJSON(ret_list), w)
  TRUE
}


if(exists("w"))
    websocket_close(w)
w <- setupTestServer()
daemonize(w)
removeTaskCallback(1)
addTaskCallback(getCurrentObjects)


A_spyre_numeric_test <- 1:10

A_spyre_factor_test <- as.factor(sample(c("male", "female"), 20,
                                        replace = TRUE))
A_spyre_factor_test2 <- as.factor(sample(c("male", "female"), 200,
                                        replace = TRUE))


spyre(setupTestServer)
spyre(A_spyre_numeric_test)

cat(spyre(A_spyre_factor_test))


