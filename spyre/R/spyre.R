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
