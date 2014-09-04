#' @export
getCurrentObjects <- function(a, b, c, d, ws_list) {
    express <- as.character(a)
    if(grepl(".ess_|.ess.", express)) {
        cat("\nreturning early!\n", file = "/home/erik/testing.txt", append = TRUE)
        return(TRUE)
    }

    env <- get_selected_env()
    objects <- objects(env)
    objects_list <- lapply(objects, generate_object_list)

    ret_list <- list(event = "objects", data = objects_list)
    env_list <- list(event = "environments", data = search())
    action_list <- list(event = "actions", data = actions())

    send_info <- function(ws) {
        ws$send(jsonlite::toJSON(ret_list))
        ws$send(jsonlite::toJSON(env_list))
        ws$send(jsonlite::toJSON(action_list))
    }

    ## but why would ws_list ever be missing?
    if(missing(ws_list)) {
        ws_list <- get("spyre_clients", pos = "package:spyre")
    }
    lapply(ws_list, send_info)
    
    TRUE
}
