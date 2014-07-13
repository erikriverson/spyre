#' @import ggvis

ggvis_explorer <- function(D) {
    objs <- lapply(D, iget)
    jsonlite::toJSON(ggvis_spyre(objs, D))
}

ggvis_spyre <- function(objs, names, ...) {
    message(paste0(names, collapse = " "))
    message(paste0(str(objs), collapse = "\n"))
    summary <- paste(c(capture.output(cor(objs[[1]], objs[[2]]))))

    value <- as.data.frame(objs)
    value <- value[complete.cases(value), ]
    message(names(value))

    if(length(objs[["fill"]]) == 1) {
        fill_scale <- objs[["fill"]]
    } else {
        fill_scale <- ~fill
    }

    if(length(objs[["stroke"]]) == 1) {
        stroke_scale <- objs[["stroke"]]
    } else {
        stroke_scale <- ~stroke
    }

    ggvis_plot <- value %>%
        ggvis(x = ~xvar, y = ~yvar, prop("fill", fill_scale),
              prop("stroke", stroke_scale)) %>%
        layer_points()
            
    ggvis_spec <-
        jsonlite::unbox(paste0(capture.output(show_spec(ggvis_plot)),
                               collapse = ""))

    list(event = "mv", data = list(summary = summary, value = ggvis_spec))
}
