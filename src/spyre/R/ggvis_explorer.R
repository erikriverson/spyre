ggvis_explorer <- function(D) {
    objs <- lapply(D, iget)
    jsonlite::toJSON(ggvis_spyre(objs, D))
}

ggvis_spyre <- function(objs, names, ...) {
    message(paste0(names, collapse = " "))
    summary <- paste(c(capture.output(cor(objs[[1]], objs[[2]]))))

    value <- data.frame(var1 = objs[[1]], var2 = objs[[2]], var3 = objs[[3]])
    value <- value[complete.cases(value), ]

    ggvis_plot <- value %>% ggvis(~var1, ~var2, fill = ~var3) %>% layer_points()
            
    ggvis_spec <-
        unbox(paste0(capture.output(show_spec(ggvis_plot)), collapse = ""))

    list(event = "mv", data = list(summary = summary, value = ggvis_spec))
}
