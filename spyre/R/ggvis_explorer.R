#' @import ggvis

ggvis_explorer <- function(D) {
    objs <- lapply(D, iget)
    jsonlite::toJSON(ggvis_spyre(objs, D))
}

ggvis_spyre <- function(objs, names, ...) {
    message(paste0(names, collapse = " "))
    summary <- paste(c(capture.output(cor(objs[[1]], objs[[2]]))))

    value <- as.data.frame(objs)
    value <- value[complete.cases(value), ]
    message(names(value))

    ggvis_plot <- value %>% ggvis(~xvar_target, ~yvar_target, fill := ~fill_target) %>%
        layer_points()
            
    ggvis_spec <-
        jsonlite::unbox(paste0(capture.output(show_spec(ggvis_plot)), collapse = ""))

    list(event = "mv", data = list(summary = summary, value = ggvis_spec))
}
