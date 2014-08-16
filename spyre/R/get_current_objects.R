#' @export
getCurrentObjects <- function(a, b, c, d, ws) {

        env <- get_selected_env()
        
        objects <- objects(env)
        objects_list <- lapply(objects, generate_object_list)

        ## what is this doing?
        ## objects_list <- lapply(seq_along(objects_list),
        ##                        function (i) sapply(objects_list, "[", i))

        ret_list <- list(event = "objects", data = objects_list)
        ws$send(jsonlite::toJSON(ret_list))

        env_list <- list(event = "environments", data = search())
        ws$send(jsonlite::toJSON(env_list))

        action_list <- list(event = "actions", data = actions())
        ws$send(jsonlite::toJSON(action_list))

        TRUE
    }


