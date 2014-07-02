ggvis_explorer <- function(x, y, z, names, ...) {
    message(paste0(names, collapse = " "))
    summary <- paste(c(capture.output(cor(x, y))))

    value <- data.frame(var1 = x, var2 = y, var3 = z)
    value <- value[complete.cases(value), ]

    ggvis_plot <- value  %>% ggvis(~var1, ~var2, fill = ~var3) %>% layer_points()
            
    ggvis_spec <-
        unbox(paste0(capture.output(show_spec(ggvis_plot)), collapse = ""))

    ggplot_object <-
        ggplot(value, aes(x = var1, y = var2)) + geom_point()

    tmpfile <- tempfile(tmpdir = "/home/erik/Dropbox/src/projects/spyre/src/client/tmp",
                        fileext = ".png")
    tmpfile_relpath <- paste0(strsplit(tmpfile, "/")[[1]][10:11], collapse = "/")
    
    png(tmpfile)
    print(ggplot_object)
    dev.off()
    
    ## need a way to limit size of x (likely)
    list(event = "mv", data = list(summary = summary, value = ggvis_spec,
                           ggpath = tmpfile_relpath))
}
