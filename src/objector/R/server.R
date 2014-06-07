################################################################################
#   Program Name:     server.R
#   Author:           Erik Iverson <erik@sigmafield.org>
#   Purpose:          httpuv implementation of spyre server
################################################################################

require(httpuv)
require(jsonlite)
require(RCurl)
require(ggvis)
require(Quandl)
source("/home/erik/Dropbox/src/projects/objector/src/objector/R/spyre.R")


get_selected_env <- function() {
    message("here we go")
    if(exists("selected_env", .GlobalEnv)) {
        as.environment(get("selected_env", .GlobalEnv))
    } else {
        as.environment(".GlobalEnv")
    }
}


get_selected_env <- function() {
    if(exists("selected_env", .GlobalEnv)) {
        selected_env
    } else {
        ".GlobalEnv"
    }
}


uv <- function(D) {
    message("I'm in uv with:")
    message(str(D))
            
    if(length(D) > 1)
        D <- iget(D[[1]], D[2:length(D)])
    else
        D <- get(D[[1]])
    
    jsonlite::toJSON(spyre(D))
}

mv <- function(D) {
    if(length(D[[2]]) == 0 || length(D[[1]]) == 0) {
        return(0)
    }

    if(length(D[[1]]) > 1)
        D1 <- iget(D[[1]][[1]], D[[1]][2:length(D[[1]])])
    else
        D1 <- get(D[[1]][[1]])

    if(length(D[[2]]) == 0) {
        return(0)
    }

    if(length(D[[2]]) > 1)
        D2 <- iget(D[[2]][[1]], D[[2]][2:length(D[[2]])])
    else
        D2 <- get(D[[2]][[1]])

    names <- c(D[[1]], D[[2]])
    message(paste("names are", names))

    jsonlite::toJSON(multivariate(D1, D2, names))
}

eval_string <- function(D) {
    data <- capture.output(eval_string(D[[1]]))
    jsonlite::toJSON(list(data = list(summary = data)))
}

rawdata <- function(D) {
    D1 <- get(D[[1]][[1]])
    str(D1)
    jsonlite::toJSON(list(event = "rawdata", data = list(value = D1)))
}

generate_tree_data <- function(object, index = 1, parent, object_names, object_class) {

    if(missing(parent)) {
        obj_name <- object
        object <- get(object)

        ## test with multi-class objects (ggplot2, data.table, etc.)
        parent <- list(class = class(object),
                       label = unbox(obj_name),
                       data = list(root_object = unbox(obj_name),
                           object_index = list(obj_name)))
        
    } else {
        parent <- list(class = object_class,
                       label = unbox(object_names[index]),
                       data = list(root_object = parent$data$root_object,
                           object_index = c(parent$data$object_index,
                               object_names[[index]])))
    }

    if(!is.list(object)) {
        return(parent)
    }


    named <- if(is.null(names(object))) {
        rep(FALSE, length(object))
    } else {
        ifelse(names(object) == "", FALSE, TRUE)
    }
    
    children <- mapply(generate_tree_data,
                       object = object,
                       index = seq_along(object),
                       object_class = lapply(object, class),
                       MoreArgs = list(parent = parent,
                           object_names = ifelse(named, names(object),
                               seq_along(object))),
                       SIMPLIFY = FALSE, USE.NAMES = FALSE)

    c(parent, children = list(children))
}

`%i%` <- function(object, index_list) {
    if(length(index_list) == 0)
        return(object)
    object <- do.call("[[", list(object, index_list[[1]]))
    object %i% index_list[-1]
}

iget <- function(object_name, index_list) {
    obj <- get(object_name)
    obj %i% index_list
}


spyre_call <- function(req) {
    message("spyre_call")
}

CLOSE <- function(D) {
    cleanup()
}

cleanup <- function() {
    removeTaskCallback(1)
    message("removed the task callback function!")
}

spyre_onWSOpen <- function(ws) {

    ## does ws have to be captured by lexical scoping in the following function?
    getCurrentObjects <- function(a, b, c, d) {

        if(length(a) == 0 || as.character(a) %in%
           c(".ess_help", ".ess_funargs", ".ess_get_completions")) {
            cat("\nskipping rest of function", file = "/home/erik/spyre.log", append = TRUE)
            return(TRUE)
        }

        env <- get_selected_env()
        
        objects <- objects(env)
        objects_list <- lapply(objects, generate_tree_data)

        ## what is this doing?
        ## objects_list <- lapply(seq_along(objects_list),
        ##                        function (i) sapply(objects_list, "[", i))

        ret_list <- list(event = "objects", data = objects_list)
        ws$send(jsonlite::toJSON(ret_list))

        env_list <- list(event = "environments", data = search())
        ws$send(toJSON(env_list))
        
        TRUE
    }

    set_selected_env <- function(D) {
        assign("selected_env", D, envir = .GlobalEnv)
        getCurrentObjects("bootstrap", NULL, NULL, NULL)
    }

    process_data <- function(binary_flag, data) {
        message("processing data")
        str(data)
        E <- jsonlite::fromJSON(data)$event
        D <- jsonlite::fromJSON(data)$data
        
        message(paste("calling function:", E))
        message(str(D))

        R <- do.call(E, list(D))
        send_data(R)
    }
        
    send_data <- function(msg) {
        ## don't throw error when we don't construct a valid return
        ## value. A definition and check for 'valid return value' is
        ## needed.
        if(is.character(msg))                
            ws$send(msg)
    }

    eval_string <- function(string) {
        ## save the value to return
        ret <- tryCatch(eval(parse(text = string), env = .GlobalEnv), error =
                        function(e) as.character(e))
        ## in case objects get created
        getCurrentObjects("bootstrap", NULL, NULL, NULL)
        ret
    }

    import <- function(D) {
        D <- substr(D, 22, nchar(D))
        assign("aaa_csv_import",
               read.table(text = base64Decode(D), header = TRUE, sep = ","), pos = .GlobalEnv)
        getCurrentObjects("bootstrap", NULL, NULL, NULL)
    }

    import_quandl <- function(D) {
        assign("quandl_test_import", Quandl(D), pos = .GlobalEnv)
        getCurrentObjects("bootstrap", NULL, NULL, NULL)
    }

    ws$onMessage(process_data)
    ws$onClose(cleanup)

    addTaskCallback(getCurrentObjects)
    message("added task callback")
    ## initial list
    getCurrentObjects("bootstrap", NULL, NULL, NULL)
}

#' @export
start_spyre <- function(app) {
    app <- list(call = spyre_call, onWSOpen = spyre_onWSOpen)
    startDaemonizedServer("127.0.0.1", 7681, app = app)
}

#' @export
stop_spyre <- function(handle) {
    stopDaemonizedServer(handle)
}


## bootstrap
if(exists("hndl"))
    stop_spyre(hndl)
hndl <- start_spyre()
