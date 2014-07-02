generate_object_list <- function(object, index = 1, parent, object_names,
                                 object_class) {

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
