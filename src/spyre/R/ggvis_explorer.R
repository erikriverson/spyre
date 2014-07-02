ggvis_explorer <- function(D) {
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


    if(length(D[[3]]) > 1)
        D3 <- iget(D[[3]][[1]], D[[3]][2:length(D[[3]])])
    else
        D3 <- get(D[[3]][[1]])

    names <- c(D[[1]], D[[2]], D[[3]])
    message(paste("names are", names), collapse = "\n")

    jsonlite::toJSON(multivariate(D1, D2, D3, names))
}


ggvis_spyre <- function(x, y, z, names, ...) {
    message(paste0(names, collapse = " "))
    summary <- paste(c(capture.output(cor(x, y))))

    value <- data.frame(var1 = x, var2 = y, var3 = z)
    value <- value[complete.cases(value), ]

    ggvis_plot <- value %>% ggvis(~var1, ~var2, fill = ~var3) %>% layer_points()
            
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
